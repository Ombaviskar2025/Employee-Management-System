/**
 * LoadingSpinner.jsx
 * Animated loading spinner component.
 * Can be used inline or as a full-page overlay.
 */

const LoadingSpinner = ({ fullPage = false, size = "md", text = "" }) => {
  const sizes = {
    sm: "spinner-sm",
    md: "spinner-md",
    lg: "spinner-lg",
  };

  const spinner = (
    <div className={`spinner-wrapper ${fullPage ? "spinner-fullpage" : ""}`}>
      <div className={`spinner ${sizes[size]}`} />
      {text && <p className="spinner-text">{text}</p>}
    </div>
  );

  return spinner;
};

export default LoadingSpinner;
