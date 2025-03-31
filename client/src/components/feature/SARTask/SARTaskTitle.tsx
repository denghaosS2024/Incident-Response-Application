import React from 'react'
import styles from '../../../styles/SARTaskPage.module.css'
import {Typography} from "@mui/material";


interface SARTaskTitleProps {
  title: string;
  subtitle: string;
}

const SARTaskTitle: React.FC<SARTaskTitleProps> = ({ title, subtitle }) => {
  return (
    <div className={styles.flexCenterColumn}>
      <Typography
        variant="h6"
        align="center"
        className={styles.bold}
        gutterBottom
      >
        {title}
      </Typography>

      <Typography
        variant="subtitle1"
        align="center"
        gutterBottom
      >
        {subtitle}
      </Typography>
    </div>
  )
}

export default SARTaskTitle
