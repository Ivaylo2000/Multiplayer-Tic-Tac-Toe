import styles from "./NotFound.module.scss";
import { Link } from "react-router-dom";
const NotFound = () => {
  return (
    <div className={styles["not-found-page"]}>
      <h1> 404 Page Not Found</h1>

      <button>
        <Link to="/" className={styles.return}>
          Back To Home page
        </Link>
      </button>
    </div>
  );
};

export default NotFound;
