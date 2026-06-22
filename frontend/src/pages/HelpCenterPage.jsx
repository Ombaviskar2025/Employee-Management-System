/**
 * HelpCenterPage.jsx
 * Interactive FAQ accordions and Support submission ticket system.
 */

import { useState } from "react";
import { FiHelpCircle, FiChevronDown, FiChevronUp, FiSend, FiMessageSquare, FiInfo } from "react-icons/fi";
import toast from "react-hot-toast";

const FAQS = [
  {
    q: "How do I add a new employee to the system?",
    a: "Click on the '+ Add Employee' button in the sidebar from any screen, or navigate to the 'Employees' tab and click the 'Add Employee' button at the top right. Fill in the required details (Name, Email, Mobile, Department, Designation, Join Date, and Salary) and click save.",
  },
  {
    q: "How do I update settings such as currency symbol or tax rates?",
    a: "Navigate to the 'Settings' page from the sidebar. You can switch between 'Company Info' and 'Payroll Config'. Under the 'Payroll Config' tab, select your preferred Currency Symbol and specify the Standard Deduction/Tax Rate. Click 'Save Changes' to apply them globally.",
  },
  {
    q: "Where is the calculated Net Salary generated?",
    a: "Calculated salaries can be found under the 'Payroll' page. The system takes each employee's base salary, automatically adds a 10% allowance bonus, and deducts the standard tax rate set in your System Settings, displaying the final net pay for processing.",
  },
  {
    q: "How are performance reviews scorecards logged?",
    a: "Navigate to the 'Performance' screen. Click 'Log Performance Review' at the top right, select the employee, click the interactive stars to assign a rating (1-5), enter the reviewer name, write feedback remarks, and submit. The average company rating will automatically update.",
  },
  {
    q: "Can I export employee data?",
    a: "Export to CSV is currently coming soon. The export button on the Employees page will be enabled in a future release.",
  },
];

const HelpCenterPage = () => {
  const [openIndex, setOpenIndex] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // Form State
  const [ticketSubject, setTicketSubject] = useState("");
  const [ticketMessage, setTicketMessage] = useState("");

  const toggleFaq = (index) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  const handleTicketSubmit = (e) => {
    e.preventDefault();
    if (!ticketSubject || !ticketMessage) {
      toast.error("Please fill out the ticket fields.");
      return;
    }

    setSubmitting(true);
    setTimeout(() => {
      setSubmitting(false);
      setTicketSubject("");
      setTicketMessage("");
      toast.success("Support ticket submitted! Our help desk will reply shortly. 📩");
    }, 1200);
  };

  const filteredFaqs = FAQS.filter(
    (faq) =>
      faq.q.toLowerCase().includes(searchQuery.toLowerCase()) ||
      faq.a.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="page">
      {/* Page Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Help Center</h1>
          <p className="page-subtitle">Find answers to frequently asked questions or submit a support ticket.</p>
        </div>
      </div>

      <div className="dashboard-grid" style={{ marginTop: "24px", gridTemplateColumns: "1.4fr 1fr" }}>
        {/* FAQs Panel */}
        <div className="card">
          <div className="card__header">
            <h2 className="card__title">
              <FiHelpCircle size={18} /> Frequently Asked Questions
            </h2>
          </div>
          <div className="card__body" style={{ padding: "20px 24px" }}>
            {/* Search FAQ */}
            <div style={{ marginBottom: "20px" }}>
              <input
                type="text"
                className="form-input"
                placeholder="Search FAQs..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            {filteredFaqs.length === 0 ? (
              <p className="empty-state">No FAQs matching your query.</p>
            ) : (
              <div className="faq-list">
                {filteredFaqs.map((faq, index) => {
                  const isOpen = openIndex === index;
                  return (
                    <div
                      key={index}
                      className={`faq-item ${isOpen ? "faq-item--open" : ""}`}
                    >
                      <button
                        className="faq-question"
                        onClick={() => toggleFaq(index)}
                      >
                        <span>{faq.q}</span>
                        {isOpen ? <FiChevronUp size={16} /> : <FiChevronDown size={16} />}
                      </button>
                      {isOpen && <div className="faq-answer">{faq.a}</div>}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Support Ticket Panel */}
        <div className="card">
          <div className="card__header">
            <h2 className="card__title">
              <FiMessageSquare size={18} /> Contact Support
            </h2>
          </div>
          <div className="card__body" style={{ padding: "24px 28px" }}>
            <form onSubmit={handleTicketSubmit}>
              <div className="form-group" style={{ marginBottom: "20px" }}>
                <label className="form-label">Issue Subject</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. Payroll calculation inquiry"
                  value={ticketSubject}
                  onChange={(e) => setTicketSubject(e.target.value)}
                  required
                />
              </div>

              <div className="form-group" style={{ marginBottom: "20px" }}>
                <label className="form-label">Message Details</label>
                <textarea
                  className="form-input"
                  rows="5"
                  placeholder="Describe your issue or feedback in detail..."
                  value={ticketMessage}
                  onChange={(e) => setTicketMessage(e.target.value)}
                  required
                />
              </div>

              <button
                type="submit"
                className="btn btn--primary"
                style={{ width: "100%", justifyContent: "center" }}
                disabled={submitting}
              >
                {submitting ? (
                  <span>Sending Ticket...</span>
                ) : (
                  <>
                    <FiSend size={15} />
                    <span>Submit Ticket</span>
                  </>
                )}
              </button>
            </form>

            <div
              style={{
                display: "flex",
                gap: "10px",
                alignItems: "flex-start",
                marginTop: "20px",
                padding: "12px 14px",
                background: "rgba(192, 193, 255, 0.05)",
                border: "1px solid rgba(192, 193, 255, 0.15)",
                borderRadius: "8px",
              }}
            >
              <FiInfo size={16} style={{ color: "var(--clr-primary)", flexShrink: 0, marginTop: "2px" }} />
              <p style={{ fontSize: "11px", color: "var(--text-muted)", lineHeight: "1.4", margin: 0 }}>
                Tickets are monitored during working hours (9:00 AM - 6:00 PM EST). Standard response window is 2-4 hours.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HelpCenterPage;
