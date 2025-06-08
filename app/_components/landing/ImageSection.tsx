"use client";

import { useState } from "react";
import Image from "next/image";
import { Camera, X } from "lucide-react";

const images = [
  {
    src: "/addTask.png",
    alt: "A user adds a new task to their list in the TaskFlow application.",
    title: "Add New Task",
  },
  {
    src: "/calendar.png",
    alt: "A user views their calendar in the TaskFlow application.",
    title: "View Your Calendar",
  },
  {
    src: "/customizeTask.png",
    alt: "A user customizes a task, setting a due date and duration.",
    title: "Customize Your Tasks",
  },
  {
    src: "/layout2.png",
    alt: "Visible app layout and the dashboard.",
    title: "Amazing app layout and useful dashboard",
  },
  {
    src: "/profile.png",
    alt: "The user profile page, displaying statistics and settings.",
    title: "Manage Your Profile",
  },
  {
    src: "/tasks2.png",
    alt: "The user tasks page, displaying tasks and settings.",
    title: "Manage Your Tasks",
  },
  {
    src: "/today.png",
    alt: "A user views their tasks for the current day in the TaskFlow application.",
    title: "Tasks for Today",
  },
  {
    src: "/inbox.png",
    alt: "A user views their inbox in the TaskFlow application.",
    title: "Inbox",
  },
  {
    src: "/repetitionRules.png",
    alt: "A user sets up repetition rules for a task in the TaskFlow application.",
    title: "Repetition Rules",
  },
];

export default function ImageSection() {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  return (
    <>
      <section className="py-16 md:py-24 bg-background-650">
        <div className="container mx-auto px-6 text-center">
          <div className="inline-block p-3 mb-4 bg-accent/10 rounded-xl">
            <Camera className="w-10 h-10 sm:w-12 sm:h-12 text-accent" />
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold text-text-high mb-6">
            See TaskFlow in Action
          </h2>
          <p className="text-text-low max-w-xl mx-auto mb-10 text-base sm:text-lg">
            Visual examples of TaskFlow helping you manage your daily schedule,
            track progress, and customize your tasks.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
            {images.map((image) => (
              <div
                key={image.src}
                className="group aspect-video bg-background-600 rounded-lg shadow-xl overflow-hidden cursor-pointer"
                onClick={() => setSelectedImage(image.src)}
              >
                <Image
                  src={image.src}
                  alt={image.alt}
                  width={600}
                  height={338}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
              </div>
            ))}
          </div>
          <p className="mt-12 text-text-low">
            Tip: Click on any image to view a larger version.
          </p>
        </div>
      </section>

      {selectedImage && (
        <div
          className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4"
          onClick={() => setSelectedImage(null)}
        >
          <div
            className="relative  max-h-full"
            onClick={(e) => e.stopPropagation()}
          >
            <Image
              src={selectedImage}
              alt="Enlarged view"
              width={1200}
              height={675}
              className="object-contain max-h-[90vh] max-w-[90vw] rounded-lg shadow-2xl"
            />
            <button
              onClick={() => setSelectedImage(null)}
              className="absolute -top-4 -right-4 bg-background-600 rounded-full p-2 text-text-high hover:bg-background-500 transition-colors"
              aria-label="Close image viewer"
            >
              <X size={24} />
            </button>
          </div>
        </div>
      )}
    </>
  );
}
