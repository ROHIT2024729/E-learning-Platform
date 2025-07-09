import React, { useEffect, useState } from "react";
import "./courseStudy.css";
import { useNavigate, useParams } from "react-router-dom";
import { CourseData } from "../../context/CourseContext";
import { server } from "../../main";
import Loading from "../../components/loading/loading";
import axios from "axios";
import toast from "react-hot-toast";
import VideoComments from "../../components/comments/VideoComments";

const CourseStudy = ({ user }) => {
    const params = useParams();
    const navigate = useNavigate();

    const { fetchLectures, lectures, fetchLecture, lecture, setLecture } = CourseData();

    const [loading, setLoading] = useState(true);
    const [videoError, setVideoError] = useState(false);

    useEffect(() => {
        if (user && user.role !== "admin" && !user.subscription.includes(params.id)) {
            navigate("/");
            return;
        }

        const init = async () => {
            setLecture(null); // ✅ reset selected video
            setVideoError(false);

            try {
                await fetchLectures(params.id);
            } catch (err) {
                console.error("Error fetching lectures:", err);
            }

            setLoading(false);
        };

        init();

        return () => {
            setLecture(null); // ✅ clear when leaving page
        };
    }, [params.id]);

    // ✅ FIX: safer video selection (no unnecessary API call)
    const playVideo = async (id) => {
        setVideoError(false);

        const selected = lectures.find((l) => l._id === id);

        if (selected && selected.video) {
            setLecture(selected);
        } else {
            try {
                await fetchLecture(id);
            } catch (err) {
                console.error("Error fetching lecture:", err);
            }
        }
    };

    // ✅ FIX: handle both full URL and relative path
    const getVideoSrc = () => {
        if (!lecture || !lecture.video) return "";

        if (lecture.video.startsWith("http")) {
            return lecture.video;
        }

        return `${server}/${lecture.video.replace(/\\/g, "/")}`;
    };

    if (loading) return <Loading />;

    return (
        <div className="course-study-container">
            <div className="video-section">
                {lecture && lecture.video && !videoError ? (
                    <video
                        key={lecture._id} // ✅ force re-render on change
                        src={getVideoSrc()}
                        controls
                        autoPlay
                        controlsList="nodownload noremoteplayback"
                        disablePictureInPicture
                        disableRemotePlayback
                        onError={() => {
                            console.error("Video failed to load");
                            setVideoError(true);
                        }}
                        onEnded={async () => {
                            try {
                                const token = localStorage.getItem("token");
                                const { data } = await axios.post(
                                    `${server}/api/gamification/lecture-complete`,
                                    {},
                                    { headers: { token } }
                                );
                                if (data.pointsEarned) {
                                    toast.success(`+${data.pointsEarned} points earned! 🎉`);
                                }
                            } catch (err) {
                                // Silently fail - don't block video experience
                            }
                        }}
                    />
                ) : videoError ? (
                    <div className="no-video">
                        <h2>Failed to load video</h2>
                    </div>
                ) : null}

                {lecture && lecture.title && (
                    <div className="video-info">
                        <h2>{lecture.title}</h2>
                        <p>{lecture.description}</p>
                    </div>
                )}

                {lecture && lecture._id && (
                    <VideoComments lectureId={lecture._id} />
                )}
            </div>

            <div className="lectures-sidebar">
                <h3>Course Content</h3>

                <div className="lecture-list">
                    {lectures && lectures.length > 0 ? (
                        lectures.map((l, index) => (
                            <div
                                key={l._id}
                                className={`lecture-item ${
                                    lecture?._id === l._id ? "active" : ""
                                }`}
                                onClick={() => playVideo(l._id)}
                            >
                                <div className="lecture-number">{index + 1}</div>
                                <div className="lecture-title">{l.title}</div>
                            </div>
                        ))
                    ) : (
                        <p>No lectures available for this course yet.</p>
                    )}
                </div>
            </div>
        </div>
    );
};

export default CourseStudy;