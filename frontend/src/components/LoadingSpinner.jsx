/**
 * LoadingSpinner.jsx
 * Animated loading spinner component.
 * HR Connect Midnight Indigo design.
 */

const LoadingSpinner = ({ fullPage = false, size = "md", text = "" }) => {
  const sizes = { sm: "spinner--sm", md: "spinner--md", lg: "spinner--lg" };

  return (
    <div className={`spinner-wrap ${fullPage ? "spinner-wrap--fullpage" : ""}`}>
      <div className={`spinner ${sizes[size] || "spinner--md"}`} />
      {text && <p className="spinner-text">{text}</p>}
    </div>
  );
};

export default LoadingSpinner;
