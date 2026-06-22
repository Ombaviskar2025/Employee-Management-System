import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchEmployees, approveEmployee, rejectEmployee, selectEmployees, selectEmployeeLoading } from "../redux/slices/employeeSlice";
import LoadingSpinner from "../components/LoadingSpinner";

const RegistrationsPage = () => {
  const dispatch = useDispatch();
  const employees = useSelector(selectEmployees);
  const loading = useSelector(selectEmployeeLoading);

  useEffect(() => {
    // Fetch only pending registrations
    dispatch(fetchEmployees({ status: "pending", limit: 100 }));
  }, [dispatch]);

  const handleApprove = (id) => {
    if (window.confirm("Are you sure you want to approve this employee registration?")) {
      dispatch(approveEmployee(id));
    }
  };

  const handleReject = (id) => {
    if (window.confirm("Are you sure you want to reject and delete this registration?")) {
      dispatch(rejectEmployee(id));
    }
  };

  // Filter local state just to be safe
  const pendingApps = employees.filter(emp => emp.status === "pending");

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h1 className="page-title">Pending Registrations</h1>
          <p className="page-desc">Approve or reject employee self-registrations</p>
        </div>
      </div>

      {loading ? (
        <LoadingSpinner />
      ) : pendingApps.length === 0 ? (
        <div className="card card--empty">
          <p>No pending employee registration requests.</p>
        </div>
      ) : (
        <div className="card overflow-hidden">
          <div className="table-responsive">
            <table className="table">
              <thead>
                <tr>
                  <th>Full Name</th>
                  <th>Email</th>
                  <th>Mobile Number</th>
                  <th>Department</th>
                  <th>Designation</th>
                  <th>Joining Date</th>
                  <th style={{ textAlign: "right" }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {pendingApps.map((emp) => (
                  <tr key={emp._id}>
                    <td>
                      <div className="font-semibold text-white">{emp.fullName}</div>
                    </td>
                    <td>{emp.email}</td>
                    <td>{emp.mobileNumber}</td>
                    <td>{emp.department}</td>
                    <td>{emp.designation}</td>
                    <td>{new Date(emp.joiningDate).toLocaleDateString()}</td>
                    <td>
                      <div style={{ display: "flex", gap: "8px", justifyContent: "flex-end" }}>
                        <button
                          className="btn btn--sm"
                          style={{ background: "#10b981", color: "white" }}
                          onClick={() => handleApprove(emp._id)}
                        >
                          Approve
                        </button>
                        <button
                          className="btn btn--sm"
                          style={{ background: "#ef4444", color: "white" }}
                          onClick={() => handleReject(emp._id)}
                        >
                          Reject
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default RegistrationsPage;
