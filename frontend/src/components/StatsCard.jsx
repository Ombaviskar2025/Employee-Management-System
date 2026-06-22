/**
 * StatsCard.jsx
 * Dashboard KPI stat card with icon, value, label, and trend.
 */

const StatsCard = ({ icon: Icon, label, value, trend, color = "blue", loading = false }) => {
  return (
    <div className={`stats-card stats-card--${color}`}>
      <div className="stats-card__body">
        <div className="stats-card__info">
          <p className="stats-card__label">{label}</p>
          {loading ? (
            <div className="stats-card__skeleton" />
          ) : (
            <h3 className="stats-card__value">{value ?? "—"}</h3>
          )}
          {trend !== undefined && !loading && (
            <p className={`stats-card__trend ${trend >= 0 ? "trend-up" : "trend-down"}`}>
              {trend >= 0 ? "↑" : "↓"} {Math.abs(trend)}% this month
            </p>
          )}
        </div>
        <div className="stats-card__icon-wrap">
          <Icon size={28} />
        </div>
      </div>
      <div className="stats-card__glow" />
    </div>
  );
};

export default StatsCard;
