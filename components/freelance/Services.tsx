"use client";
import React , { useEffect } from "react";
import {
  faApple,
  faAndroid,
  faReact,
  faNodeJs,
  faPhp,
  faJava
} from "@fortawesome/free-brands-svg-icons";
import {
  faDesktop,
  faAnglesDown,
  faAnglesUp,
  faFire,
  faGear,
  faGlobe,
  faMobileScreenButton,
  faTv,
  faWind,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

//i18n
import { withTranslation } from "react-i18next";
import i18n from "@/libs/localize/localize";
import SingleService, { Service } from "./Partials/SingleService";
import Link from "next/link";

const ServicesHero = () => {
  const { t } = i18n;

  const [expanded, setExpanded] = React.useState(true);
  const container = React.useRef(null);


  const projects: Service[] = [
    {
      id: "1",
      image: "/assests/img/services/phone.jpg",
      title: "Mobile App Development",
      description:
        "We develop mobile applications for both Android and iOS platforms. We use the latest technologies and tools to deliver high-quality applications.",
      urls: [
        { type: "GitHub", url: "https://github.com/kuraykaraaslan/pegasus" },
        { type: "Demo", url: "https://pegasus.kuray.dev" },
      ],
      tags: [
        { name: "Android", color: "bg-green-200", icon: faAndroid },
        { name: "Apple", color: "bg-blue-200", icon: faApple },
        { name: "React Native", color: "bg-blue-200", icon: faReact },
      ],
    },
    {
      id: "2",
      image: "/assests/img/services/web.jpg",
      title: "Web Development",
      description:
        "We develop web applications using the latest technologies and tools. We design and develop responsive and user-friendly web applications.",
      urls: [
        { type: "GitHub", url: "https://github.com/kuraykaraaslan/pegasus" },
        { type: "Demo", url: "https://pegasus.kuray.dev" },
      ],
      tags: [
        { name: "React", color: "bg-blue-200", icon: faReact },
        { name: "Web", color: "bg-yellow-200", icon: faGlobe },
        { name: "Desktop", color: "bg-yellow-200", icon: faDesktop },
      ],
    },
    {
      id: "3",
      image: "/assests/img/services/backend.jpg",
      title: "Backend Development",
      description:
        "We develop backend applications using the latest technologies and tools. We design and develop scalable and secure backend applications.",
      urls: [],
      tags : [
        { name: "Node.js", color: "bg-green-200", icon: faWind },
        { name: "PHP", color: "bg-purple-200", icon: faPhp },
        { name: "Java", color: "bg-red-200", icon: faJava }
      ]
    },
    {
      id: "4",
      image: "/assests/img/services/other2.jpg",
      title: "Need Something Else?",
      bgColor: "bg-base-200",
      description:
        "We can help you with your custom software development needs. Contact us to discuss your project.",
      urls: [],
      tags: []
    }
  ];

  return (
    <>
      <section className="bg-base-100 pt-16" id="projects">
        <div
          className="px-4 mx-auto max-w-screen-xl lg:pb-16 lg:px-6 duration-1000"
          ref={container}
        >
          <div className="mx-auto max-w-screen-sm text-center lg:mb-16 mb-8 -mt-8 lg-mt-0">
            <h2 className="mb-4 text-3xl lg:text-4xl tracking-tight font-extrabold">
              {t("SERVICES.TITLE")}
            </h2>
            <p className="font-light sm:text-xl">{t("SERVICES.DESCRIPTION")}</p>
          </div>
          <div className="grid gap-8 lg:grid-cols-2">
            {projects.map((service: Service) => (
              <SingleService key={service.id} service={service} />
            ))}
          </div>
        </div>

        <div
          className="flex carousel-indicators gap-2 bg-transparent select-none"
          style={{
            zIndex: 50,
            position: "relative",
            left: "0",
            right: "0",
            margin: "auto",
            height: "0px",
            width: "100%",
            bottom: "20",
            display: "flex",
            justifyContent: "center",
          }}
        >
        </div>
      </section>
    </>
  );
};

export default withTranslation()(ServicesHero);