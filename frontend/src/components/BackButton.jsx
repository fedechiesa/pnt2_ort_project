import { useNavigate } from "react-router-dom";

const BackButton = ({ label = "Volver" }) => {
  const navigate = useNavigate();

  return (
    <div className="back-btn-wrapper">
      <button type="button" className="back-btn" onClick={() => navigate(-1)}>
        <span aria-hidden="true">&#x2190;</span>
        <span>{label}</span>
      </button>
    </div>
  );
};

export default BackButton;
