import React, { useState, useEffect } from "react";
import {
  Search,
  Plus,
  Grid3x3,
  List,
  X,
} from "lucide-react";

import { STATS, TABS, PROJECTS, ACTIVITY, TOP_COLLABORATORS, OVERVIEW, SEED_APPLICATIONS, AVATAR_COLORS, TAG_STYLES, avatarInitials } from "../data";

import DonutChart from "../components/chart";
import ProjectCard from "../components/ProjectCard";
import ApplyModal from "../components/ApplyModal";
import ApplicationsModal from "../components/ApplicationsModal";
import SortDropdown from "../components/SortDropdown";
import FilterDropdown from "../components/FilterDropdown";

// Maps each visible tab label to the project.category value it should filter by.
// "All Projects" has no category filter — every project matches.
const TAB_TO_CATEGORY = {
  "All Projects": null,
  "Owned by Me": "owned",
  Collaborating: "collaborating",
  Invited: "invited",
  Completed: "completed",
  Archived: "archived",
};

const ITEMS_PER_PAGE = 4;

export default function ProjectsPage() {
  const [activeTab, setActiveTab] = useState("All Projects");
  const [search, setSearch] = useState("");
  const [projects, setProjects] = useState(PROJECTS);
  const [applyingProject, setApplyingProject] = useState(null);
  const [appliedIds, setAppliedIds] = useState(() => new Set());
  const [applications, setApplications] = useState(SEED_APPLICATIONS);
  const [viewingApplicationsProject, setViewingApplicationsProject] = useState(null);
  const [sortBy, setSortBy] = useState("newest");
  const [filter, setFilter] = useState("all");
  const [selectedProject, setSelectedProject] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);

  const filteredProjects = [...projects]
    .filter((project) => {
      const query = search.toLowerCase();

      const matchesSearch =
        project.title?.toLowerCase().includes(query) ||
        project.description?.toLowerCase().includes(query) ||
        project.pi?.toLowerCase().includes(query) ||
        project.tags?.some((tag) => tag.toLowerCase().includes(query));

      const requiredCategory = TAB_TO_CATEGORY[activeTab];

      const matchesTab = requiredCategory
        ? project.category === requiredCategory
        : true;

      let matchesFilter = true;

      switch (filter) {
        case "active":
          matchesFilter = project.status?.toLowerCase() === "active";
          break;

        case "completed":
          matchesFilter = project.category === "completed";
          break;

        case "archived":
          matchesFilter = project.category === "archived";
          break;

        case "open":
          matchesFilter = project.openToCollaboration;
          break;

        default:
          matchesFilter = true;
      }

      return matchesSearch && matchesTab && matchesFilter;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case "az":
          return a.title.localeCompare(b.title);

        case "members":
          return (
            (b.members ?? b.collaborators ?? 0) -
            (a.members ?? a.collaborators ?? 0)
          );

        case "deadline":
          if (!a.deadline || !b.deadline) return 0;
          return new Date(a.deadline) - new Date(b.deadline);

        case "oldest":
          if (!a.createdAt || !b.createdAt) return 0;
          return new Date(a.createdAt) - new Date(b.createdAt);

        default:
          if (!a.createdAt || !b.createdAt) return 0;
          return new Date(b.createdAt) - new Date(a.createdAt);
      }
    });

  const totalPages = Math.max(1, Math.ceil(filteredProjects.length / ITEMS_PER_PAGE));

  const currentProjects = filteredProjects.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  // Any time search, filter, sort, or the active tab changes, jump back to
  // page 1 so the user never lands on an out-of-range page.
  useEffect(() => {
    setCurrentPage(1);
  }, [search, filter, sortBy, activeTab]);

  function toggleOpenToCollaboration(id) {
    setProjects((prev) =>
      prev.map((p) =>
        p.id === id ? { ...p, openToCollaboration: !p.openToCollaboration } : p
      )
    );
  }

  function handleApplySubmit(name, message) {
    setApplications((prev) => [
      ...prev,
      {
        id: `app-${Date.now()}`,
        projectId: applyingProject.id,
        applicantName: name,
        message,
        appliedAt: "Just now",
        status: "pending",
      },
    ]);
    setAppliedIds((prev) => new Set(prev).add(applyingProject.id));
    setApplyingProject(null);
    // In a real app: POST { projectId, name, message } to your collaboration-requests endpoint here.
  }

  function handleAcceptApplication(appId) {
    setApplications((prev) =>
      prev.map((a) => (a.id === appId ? { ...a, status: "accepted" } : a))
    );
    // In a real app: notify the applicant and add them to the project's collaborator list here.
  }

  function handleDeclineApplication(appId) {
    setApplications((prev) =>
      prev.map((a) => (a.id === appId ? { ...a, status: "declined" } : a))
    );
  }

  function pendingCountFor(projectId) {
    return applications.filter((a) => a.projectId === projectId && a.status === "pending").length;
  }

  function applicationsCountFor(projectId) {
    return applications.filter((a) => a.projectId === projectId).length;
  }

  return (
    <div className="w-full bg-slate-50 font-sans text-slate-900">
      <div className="px-6 py-6">
        <div className="flex flex-col gap-6 xl:flex-row">
            {/* Left / center column */}
            <div className="flex-1">
              <div className="mb-5">
                <h1 className="text-2xl font-bold text-slate-900">My Projects</h1>
                <p className="text-sm text-slate-500">
                  Manage your research projects and collaborations
                </p>
              </div>

              {/* Search + filter row */}
              <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center">

                {/* Search */}
                <div className="relative flex-1">
                  <Search
                    size={16}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                  />

                  <input
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search projects..."
                    className="w-full rounded-lg border border-slate-200 py-2 pl-10 pr-4 outline-none focus:border-blue-500"
                  />
                </div>

                {/* Filter */}
                <FilterDropdown value={filter} onChange={setFilter} />

                {/* Sort */}
                <SortDropdown value={sortBy} onChange={setSortBy} />

                {/* View Toggle */}
                <div className="flex items-center gap-1 rounded-lg border border-slate-200 bg-white p-1">
                  <button className="rounded-md bg-blue-50 p-1.5 text-blue-600">
                    <Grid3x3 size={16} />
                  </button>

                  <button className="rounded-md p-1.5 text-slate-400 hover:bg-slate-50">
                    <List size={16} />
                  </button>
                </div>

              </div>

              {/* Stat cards */}
              <div className="mb-5 grid grid-cols-2 gap-3 lg:grid-cols-4">
                {STATS.map((s) => {
                  const Icon = s.icon;
                  return (
                    <div
                      key={s.key}
                      className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white p-4"
                    >
                      <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${s.tint}`}>
                        <Icon size={18} />
                      </div>
                      <div>
                        <p className="text-xs text-slate-500">{s.label}</p>
                        <p className="text-xl font-bold text-slate-900">{s.value}</p>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Tabs */}
              <div className="mb-2 flex gap-6 border-b border-slate-200 text-sm font-medium text-slate-500 overflow-x-auto">
                {TABS.map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`whitespace-nowrap border-b-2 pb-3 pt-1 transition-colors ${
                      activeTab === tab
                        ? "border-blue-600 text-blue-600"
                        : "border-transparent hover:text-slate-700"
                    }`}
                  >
                    {tab}
                  </button>
                ))}
              </div>

              {/* Project list */}
              <div className="rounded-xl border border-slate-200 bg-white px-5">
                {filteredProjects.length ? (
                  currentProjects.map((p) => (
                    <ProjectCard
                      key={p.id}
                      project={p}
                      onToggleOpen={toggleOpenToCollaboration}
                      onApply={setApplyingProject}
                      hasApplied={appliedIds.has(p.id)}
                      pendingCount={pendingCountFor(p.id)}
                      onViewApplications={setViewingApplicationsProject}
                      onClick={setSelectedProject}
                    />
                  ))
                ) : (
                  <p className="py-10 text-center text-sm text-slate-400">
                    No projects in this view yet.
                  </p>
                )}
              </div>

              {/* Pagination */}
              {filteredProjects.length > 0 && (
                <div className="mt-4 flex items-center justify-center gap-1.5">
                  <button
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    Previous
                  </button>

                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                    <button
                      key={page}
                      onClick={() => setCurrentPage(page)}
                      className={`h-8 w-8 rounded-lg text-xs font-semibold ${
                        page === currentPage
                          ? "bg-blue-600 text-white"
                          : "border border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                      }`}
                    >
                      {page}
                    </button>
                  ))}

                  <button
                    onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                    className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    Next
                  </button>
                </div>
              )}
            </div>

            {/* Right sidebar */}
            <aside className="w-full flex-shrink-0 space-y-5 xl:w-80">
              <button className="flex w-full items-center justify-center gap-2 rounded-lg bg-blue-600 py-2.5 text-sm font-semibold text-white hover:bg-blue-700">
                <Plus size={16} /> Create New Project
              </button>

              {/* Overview */}
              <div className="rounded-xl border border-slate-200 bg-white p-5">
                <h3 className="mb-4 text-sm font-semibold text-slate-800">Projects Overview</h3>
                <div className="flex items-center gap-6">
                  <DonutChart />
                  <div className="space-y-2 text-xs">
                    {OVERVIEW.map((o) => (
                      <div key={o.key} className="flex items-center gap-2">
                        <span
                          className="h-2 w-2 rounded-full"
                          style={{ backgroundColor: o.color }}
                        />
                        <span className="text-slate-500">{o.label} {o.value}</span>
                        {o.pct === 12.5 && (
                          <span className="text-slate-400">({o.pct}%)</span>
                        )}
                        {o.pct === 50 && o.key === "active2" && (
                          <span className="text-slate-400">({o.pct}%)</span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Recent Activity */}
              <div className="rounded-xl border border-slate-200 bg-white p-5">
                <h3 className="mb-4 text-sm font-semibold text-slate-800">Recent Activity</h3>
                <div className="space-y-4">
                  {ACTIVITY.map((a) => {
                    const Icon = a.icon;
                    return (
                      <div key={a.id} className="flex gap-3">
                        <div className={`flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full ${a.iconTint}`}>
                          <Icon size={14} />
                        </div>
                        <p className="text-sm leading-snug text-slate-600">
                          <span className="font-semibold text-slate-800">{a.name}</span>{" "}
                          {a.action}{" "}
                          <span className="font-medium text-blue-600">{a.target}</span>
                          <br />
                          <span className="text-xs text-slate-400">{a.time}</span>
                        </p>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Top Collaborators */}
              <div className="rounded-xl border border-slate-200 bg-white p-5">
                <h3 className="mb-4 text-sm font-semibold text-slate-800">Top Collaborators</h3>
                <div className="space-y-3">
                  {TOP_COLLABORATORS.map((c, i) => (
                    <div key={c.id} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div
                          className={`flex h-9 w-9 items-center justify-center rounded-full text-xs font-semibold text-white ${AVATAR_COLORS[i % AVATAR_COLORS.length]}`}
                        >
                          {avatarInitials(c.name)}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-slate-800">{c.name}</p>
                          <p className="text-xs text-slate-400">{c.projects} Projects</p>
                        </div>
                      </div>
                      <button className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-semibold text-blue-600 hover:bg-slate-50">
                        View Profile
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </aside>
        </div>
      </div>

      {applyingProject && (
        <ApplyModal
          project={applyingProject}
          onClose={() => setApplyingProject(null)}
          onSubmit={handleApplySubmit}
        />
      )}

      {viewingApplicationsProject && (
        <ApplicationsModal
          project={viewingApplicationsProject}
          applications={applications.filter(
            (a) => a.projectId === viewingApplicationsProject.id
          )}
          onClose={() => setViewingApplicationsProject(null)}
          onAccept={handleAcceptApplication}
          onDecline={handleDeclineApplication}
        />
      )}

      {/* Project Details Drawer */}
      {selectedProject && (
        <div className="fixed inset-0 z-50 flex justify-end">
          {/* Overlay — click outside the drawer to close */}
          <div
            className="absolute inset-0 bg-slate-900/40"
            onClick={() => setSelectedProject(null)}
          />

          <div className="relative flex h-full w-full max-w-md flex-col overflow-y-auto bg-white shadow-xl">
            <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
              <h2 className="text-lg font-semibold text-slate-900">Project Details</h2>
              <button
                onClick={() => setSelectedProject(null)}
                className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-50 hover:text-slate-600"
              >
                <X size={18} />
              </button>
            </div>

            <div className="flex-1 space-y-5 px-6 py-5">
              <div>
                <h3 className="text-xl font-bold text-slate-900">{selectedProject.title}</h3>
                <p className="mt-1 text-sm leading-relaxed text-slate-500">
                  {selectedProject.description}
                </p>
              </div>

              <div className="flex flex-wrap gap-2">
                {selectedProject.tags?.map((tag) => (
                  <span
                    key={tag}
                    className={`rounded-md px-2 py-0.5 text-xs font-medium ${TAG_STYLES[tag] || "bg-slate-100 text-slate-600"}`}
                  >
                    {tag}
                  </span>
                ))}
              </div>

              <dl className="grid grid-cols-2 gap-x-4 gap-y-4 text-sm">
                <div>
                  <dt className="text-xs text-slate-400">Principal Investigator</dt>
                  <dd className="mt-0.5 font-medium text-slate-800">
                    {selectedProject.pi || "Not specified"}
                  </dd>
                </div>
                <div>
                  <dt className="text-xs text-slate-400">Members</dt>
                  <dd className="mt-0.5 font-medium text-slate-800">
                    {selectedProject.members ?? selectedProject.collaborators ?? "N/A"}
                  </dd>
                </div>
                <div>
                  <dt className="text-xs text-slate-400">Deadline</dt>
                  <dd className="mt-0.5 font-medium text-slate-800">
                    {selectedProject.deadline || "No deadline set"}
                  </dd>
                </div>
                <div>
                  <dt className="text-xs text-slate-400">Status</dt>
                  <dd className="mt-0.5 font-medium text-slate-800">
                    {selectedProject.status || "Unknown"}
                  </dd>
                </div>
                <div>
                  <dt className="text-xs text-slate-400">Progress</dt>
                  <dd className="mt-0.5 font-medium text-slate-800">
                    {selectedProject.progress != null ? `${selectedProject.progress}%` : "Not tracked"}
                  </dd>
                </div>
                <div>
                  <dt className="text-xs text-slate-400">Visibility</dt>
                  <dd className="mt-0.5 font-medium text-slate-800">
                    {selectedProject.visibility || "Not specified"}
                  </dd>
                </div>
                <div>
                  <dt className="text-xs text-slate-400">Applications</dt>
                  <dd className="mt-0.5 font-medium text-slate-800">
                    {applicationsCountFor(selectedProject.id)}
                  </dd>
                </div>
              </dl>

              {selectedProject.progress != null && (
                <div>
                  <div className="mb-1 flex items-center justify-between text-xs text-slate-400">
                    <span>Progress</span>
                    <span>{selectedProject.progress}%</span>
                  </div>
                  <div className="h-2 w-full rounded-full bg-slate-100">
                    <div
                      className="h-2 rounded-full bg-blue-600"
                      style={{ width: `${selectedProject.progress}%` }}
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}