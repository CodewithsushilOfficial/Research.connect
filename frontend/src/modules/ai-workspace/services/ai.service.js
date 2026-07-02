import axiosInstance from "../../../api/axiosInstance";

class AiService {
  constructor() {
    this.activeController = null;
  }

  /**
   * Stop the active AI generation stream
   */
  stopGeneration() {
    if (this.activeController) {
      this.activeController.abort();
      this.activeController = null;
    }
  }

  /**
   * Helper to map workspace internal IDs to API endpoints
   */
  getEndpoint(workspace) {
    let endpoint = workspace;
    if (workspace === "methodology-generator") endpoint = "methodology";
    if (workspace === "paper-reviewer") endpoint = "paper-review";
    if (workspace === "proposal-generator") endpoint = "proposal";
    if (workspace === "thesis-assistant") endpoint = "thesis";
    if (workspace === "dataset-finder") endpoint = "dataset";
    if (workspace === "journal-recommendation") endpoint = "journal";
    if (workspace === "conference-recommendation") endpoint = "conference";
    return endpoint;
  }

  /**
   * Uploads an attachment to the backend
   */
  async uploadFile(fileObject) {
    const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api";
    const token = localStorage.getItem("token");
    const formData = new FormData();
    formData.append("file", fileObject);

    const response = await fetch(`${apiBaseUrl}/v1/ai/upload`, {
      method: "POST",
      headers: {
        ...(token && { Authorization: `Bearer ${token}` }),
      },
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `File upload failed with status ${response.status}`);
    }

    const resData = await response.json();
    return resData.data; // Contains name, path, url, size, fileType
  }

  /**
   * Performs real-time streaming of response chunks using native Fetch & ReadableStream
   */
  async generateResponseStream({
    workspace,
    prompt,
    sessionId = null,
    provider = "NVIDIA NIM",
    model = "meta/llama-3.1-70b-instruct",
    temperature = 0.7,
    contextLength = 4096,
    attachments = [],
    onChunk,
    onDone,
    onError,
  }) {
    const endpoint = this.getEndpoint(workspace);
    const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api";
    const token = localStorage.getItem("token");

    if (this.activeController) {
      this.activeController.abort();
    }
    this.activeController = new AbortController();
    const signal = this.activeController.signal;

    try {
      // 1. Pre-upload any file attachments containing raw fileObjects
      const processedAttachments = [];
      for (const att of attachments) {
        if (att.fileObject) {
          try {
            const uploaded = await this.uploadFile(att.fileObject);
            processedAttachments.push(uploaded);
          } catch (uploadErr) {
            throw new Error(`Failed to upload attachment: ${uploadErr.message}`);
          }
        } else {
          processedAttachments.push(att);
        }
      }

      const response = await fetch(`${apiBaseUrl}/v1/ai/${endpoint}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token && { Authorization: `Bearer ${token}` }),
        },
        body: JSON.stringify({
          prompt,
          sessionId,
          provider,
          model,
          temperature,
          contextLength,
          attachments: processedAttachments,
        }),
        signal,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `Server returned code ${response.status}`);
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop(); // Hold partial line in buffer

        for (const line of lines) {
          const cleanLine = line.trim();
          if (!cleanLine.startsWith("data: ")) continue;

          const jsonStr = cleanLine.replace("data: ", "");
          try {
            const data = JSON.parse(jsonStr);
            if (data.error) {
              this.activeController = null;
              if (onError) onError(new Error(data.error));
              return;
            }
            if (data.chunk && onChunk) {
              onChunk(data.chunk);
            }
            if (data.done && onDone) {
              this.activeController = null;
              onDone(data.session);
            }
          } catch (e) {
            // Ignore parse errors on incomplete packets
          }
        }
      }
    } catch (error) {
      this.activeController = null;
      if (error.name === "AbortError") {
        return;
      }
      if (onError) {
        onError(error);
      } else {
        console.error("Streaming service failure:", error);
      }
    }
  }

  /**
   * Fetch prompt templates stored in MongoDB
   */
  async getTemplates(workspace = null) {
    const params = {};
    if (workspace) {
      params.workspace = workspace;
    }
    return await axiosInstance.get("/v1/ai/templates", { params });
  }

  /**
   * Fetch daily usage and token history
   */
  async getHistory() {
    return await axiosInstance.get("/v1/ai/history");
  }

  /**
   * Fetch user's session history (filtered by workspace if specified)
   */
  async getSessions(workspace = null) {
    const params = {};
    if (workspace) {
      params.workspace = workspace;
    }
    return await axiosInstance.get("/v1/ai/sessions", { params });
  }

  /**
   * Fetch single session details (complete messages list)
   */
  async getSessionById(id) {
    return await axiosInstance.get(`/v1/ai/sessions/${id}`);
  }

  /**
   * Start a new session explicitly
   */
  async createSession(workspace, title = "New Session") {
    return await axiosInstance.post("/v1/ai/sessions", { workspace, title });
  }

  /**
   * Update session properties (rename, pin)
   */
  async updateSession(id, data) {
    return await axiosInstance.patch(`/v1/ai/sessions/${id}`, data);
  }

  /**
   * Delete session history
   */
  async deleteSession(id) {
    return await axiosInstance.delete(`/v1/ai/sessions/${id}`);
  }
}

export default new AiService();
