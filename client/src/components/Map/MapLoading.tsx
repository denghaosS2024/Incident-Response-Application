import styles from '../../styles/MapLoading.module.css';

const MapLoading = () => {
  return (
    <div className={`${styles.wrapper} ${styles.overlay}`} id="loading">
      <div className={styles.loader}>
        <div className={`${styles.loading} ${styles.one}`} />
        <div className={`${styles.loading} ${styles.two}`} />
        <div className={`${styles.loading} ${styles.three}`} />
      </div>
    </div>

    
  );
};

export default MapLoading;