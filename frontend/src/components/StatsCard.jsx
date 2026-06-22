/**
 * StatsCard.jsx
 * Dashboard KPI stat card.
 * HR Connect Midnight Indigo design — glass card with glowing icon orb.
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
          {loading ? null : <Icon size={26} />}
        </div>
      </div>
    </div>
  );
};

export default StatsCard;
