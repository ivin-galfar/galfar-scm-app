import { useState, useEffect, useRef } from "react";
import { FaUserTie } from "react-icons/fa";
import { FiExternalLink } from "react-icons/fi";
import useUserInfo from "../CustomHooks/useUserInfo";
import { Link } from "react-router-dom";
import { fetchSharePointUserPhoto, updatedocread } from "../APIs/api";
import { useMutation } from "@tanstack/react-query";
import LogoutButton from "./LogoutButton";
import { useProfileImageUrl } from "../store/userStore";

const UserDropdown = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [, setShowFavourites] = useState(false);
  const dropdownRef = useRef(null);
  const userInfo = useUserInfo();
  const { profileImageUrl, setProfileImageUrl, resetProfileImageUrl } =
    useProfileImageUrl();
  const userEmail = userInfo?.email;
  const toggleDropdown = () => setIsOpen((prev) => !prev);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
        setShowFavourites(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (!userInfo || !userEmail) return undefined;

    let isCurrent = true;
    let imageUrl;

    const fetchProfileImage = async () => {
      try {
        const photoBlob = await fetchSharePointUserPhoto(userEmail);

        if (!isCurrent) return;
        if (photoBlob.size > 0) {
          imageUrl = URL.createObjectURL(photoBlob);
        } else {
          imageUrl = "";
        }
        setProfileImageUrl(imageUrl);
      } catch {
        if (isCurrent) resetProfileImageUrl();
      }
    };

    fetchProfileImage();

    return () => {
      isCurrent = false;
      if (imageUrl) URL.revokeObjectURL(imageUrl);
    };
  }, [userInfo, userEmail]);

  const { mutate: updateDocReadMutation } = useMutation({
    mutationFn: updatedocread,
    onSuccess: (data) => {
      console.log("User clicked:", data);
    },
    onError: (error) => {
      console.log(error);
    },
  });

  const handleUpdateDocRead = () => {
    updateDocReadMutation();
  };

  return (
    <div className="relative flex h-16 items-center" ref={dropdownRef}>
      <button
        onClick={toggleDropdown}
        className="inline-flex h-9 w-9 cursor-pointer items-center justify-center rounded-full border border-white/30 bg-white/12 text-white shadow-sm transition hover:border-white/50 hover:bg-white/20 focus:outline-none focus:ring-2 focus:ring-white/40"
        aria-expanded={isOpen}
        aria-haspopup="menu"
        aria-label="Open user profile menu"
      >
        {profileImageUrl ? (
          <img
            src={profileImageUrl}
            alt=""
            className="h-full w-full rounded-full object-cover"
          />
        ) : (
          <FaUserTie size={17} aria-hidden="true" />
        )}
      </button>

      {isOpen && (
        <div
          className="absolute right-0 top-full z-[100] mt-2 w-72 max-w-[calc(100vw-2rem)] overflow-hidden rounded-xl border border-sky-100 bg-white shadow-[0_18px_45px_-18px_rgba(12,54,85,0.45)] animate-fade-in"
          role="menu"
        >
          <div className="border-b border-sky-100 bg-sky-50/80 px-5 py-4">
            <p className="text-xs font-medium text-slate-500">Signed in as</p>
            <p className="truncate text-sm font-semibold text-slate-800">
              {userEmail}
            </p>
          </div>
          <span>
            <button
              className="flex w-full cursor-pointer px-5 py-3 text-left text-sm font-medium text-slate-700 transition hover:bg-sky-50 hover:text-sky-800"
              onClick={handleUpdateDocRead}
            >
              <Link
                to="https://www.notion.so/Galfar-Intranet-2a592f8cf63380d5b90ff24cad08c79e"
                className="flex  items-center gap-2"
                target="_blank"
              >
                {" "}
                Galfar Wiki <FiExternalLink />
              </Link>
            </button>
          </span>
          <div className="border-t border-slate-100" />
          <LogoutButton className="w-full cursor-pointer px-5 py-3 text-left text-sm font-medium text-red-600 transition hover:bg-red-50">
            Logout
          </LogoutButton>
        </div>
      )}
    </div>
  );
};

export default UserDropdown;
