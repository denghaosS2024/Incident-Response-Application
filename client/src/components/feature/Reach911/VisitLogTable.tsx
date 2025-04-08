import request from "@/utils/request";
import { useEffect } from "react";

// This is still being worked on, don't use it yet
export default function VisitLogTable({ username }: { username: string }) {
  useEffect(() => {
    const visitLogs = request(`/api/patients/single?username=${username}`);
    console.log(visitLogs);
    // const fetchVisitLogs = async () => {
    //     const response = await fetch(`/api/visit-logs?username=${username}`)
    //     const data = await response.json()
    //     console.log(data)
    // }
  }, [username]);
}
