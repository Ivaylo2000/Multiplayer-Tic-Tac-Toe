import Button from "../components/Button";
import styles from "./NotFound.module.scss";
import { Link } from "react-router-dom";
const NotFound = () => {
  return (
    <div className={styles["not-found-page"]}>
      <h1> 404 Page Not Found</h1>

      <Button>
        <Link to="/" className={styles.return}>
          Back To Home page
        </Link>
      </Button>
    </div>
  );
};

export default NotFound;
