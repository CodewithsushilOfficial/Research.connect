import React from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';

export const Faq = () => {
  const faqs = [
    {
      question: 'Who can join Research Connect?',
      answer: 'Research Connect is open to academics, researchers, students, and industry professionals. We verify institutional email addresses or professional credentials to ensure the integrity of our network.',
    },
    {
      question: 'How does the AI recommendation engine work?',
      answer: 'Our AI model analyzes your profile details, publications, research interests, and interaction history to suggest highly relevant papers, active collaboration groups, and potential co-authors.',
    },
    {
      question: 'Is Research Connect free to use?',
      answer: 'Yes, the core features of Research Connect (creating a profile, sharing publications, connecting with peers, and participating in discussions) are completely free. We will introduce premium enterprise/lab tier packages in the future.',
    },
    {
      question: 'Can I upload preprints and unpublished work?',
      answer: 'Absolutely. We encourage researchers to share preprints, datasets, and abstracts to facilitate early feedback and open-access collaboration, while respecting journal copyright guidelines.',
    },
  ];

  const [openIndex, setOpenIndex] = React.useState(null);

  const toggleFaq = (index) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section id="faq" className="py-24 bg-white border-t border-border">
      <div className="max-w-3xl mx-auto px-6 sm:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-foreground tracking-tight">
            Frequently Asked Questions
          </h2>
          <p className="mt-4 text-lg text-muted-foreground font-medium">
            Clear answers to common questions about the Research Connect platform.
          </p>
        </div>

        <div className="space-y-4">
          {faqs.map((faq, index) => {
            const isOpen = openIndex === index;
            return (
              <div
                key={index}
                className="rounded-2xl border border-border bg-[#F8FAFC] overflow-hidden transition duration-200"
              >
                <button
                  onClick={() => toggleFaq(index)}
                  className="w-full flex justify-between items-center p-6 text-left font-bold text-foreground hover:bg-slate-100 transition duration-200"
                >
                  <span>{faq.question}</span>
                  {isOpen ? (
                    <ChevronUp className="h-5 w-5 text-primary" />
                  ) : (
                    <ChevronDown className="h-5 w-5 text-muted-foreground" />
                  )}
                </button>
                {isOpen && (
                  <div className="px-6 pb-6 text-muted-foreground text-sm leading-relaxed border-t border-border/50 pt-4 bg-white">
                    {faq.answer}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
