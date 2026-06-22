import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchAuditLogs } from "../redux/slices/auditLogSlice";
import LoadingSpinner from "../components/LoadingSpinner";

const AuditLogPage = () => {
  const dispatch = useDispatch();
  const { logs, loading } = useSelector((state) => state.auditLogs);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    dispatch(fetchAuditLogs());
  }, [dispatch]);

  const filteredLogs = logs.filter(log =>
    log.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
    log.details.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (log.userId?.name && log.userId.name.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="page-container">
      <div className="page-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <h1 className="page-title">Audit Logs</h1>
          <p className="page-desc">Trace security and administrative changes made in the system</p>
        </div>
        <div>
          <input
            type="text"
            className="form-input"
            placeholder="Search logs..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ width: "240px" }}
          />
        </div>
      </div>

      {loading ? (
        <LoadingSpinner />
      ) : filteredLogs.length === 0 ? (
        <div className="card card--empty">
          <p>No audit logs found.</p>
        </div>
      ) : (
        <div className="card overflow-hidden">
          <div className="table-responsive">
            <table className="table">
              <thead>
                <tr>
                  <th>Timestamp</th>
                  <th>User</th>
                  <th>Action</th>
                  <th>Details</th>
                  <th>IP Address</th>
                </tr>
              </thead>
              <tbody>
                {filteredLogs.map((log) => (
                  <tr key={log._id}>
                    <td style={{ whiteSpace: "nowrap" }}>{new Date(log.timestamp).toLocaleString()}</td>
                    <td>
                      <div className="font-semibold text-white">{log.userId?.name || "System"}</div>
                      <div style={{ fontSize: "12px", color: "rgba(255,255,255,0.4)" }}>
                        {log.userId?.email || "-"} ({log.userId?.role || "system"})
                      </div>
                    </td>
                    <td>
                      <span className="badge badge--info" style={{ fontFamily: "monospace" }}>
                        {log.action}
                      </span>
                    </td>
                    <td style={{ maxWidth: "300px", wordBreak: "break-word" }}>{log.details}</td>
                    <td>{log.ipAddress || "-"}</td>
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

export default AuditLogPage;
