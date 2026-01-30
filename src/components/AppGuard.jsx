import { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";

export default function AppGuard({ children }) {
  const navigate = useNavigate();
  const reloadHandled = useRef(false);

  useEffect(() => {
    const navType = performance.getEntriesByType("navigation")[0]?.type;

    if (navType === "reload" && !reloadHandled.current) {
      reloadHandled.current = true; // mark that we handled reload
      navigate("/", { replace: true });
    }
  }, [navigate]);

  return children;
}
