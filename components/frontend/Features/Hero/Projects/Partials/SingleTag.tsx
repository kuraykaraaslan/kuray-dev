import {
  faReact,
  faPython,
  faJava,
  faChrome,
  faNodeJs,
  faAws,
  faGoogle,
} from '@fortawesome/free-brands-svg-icons'
import { faCloud, faCode, faGlobe, IconDefinition } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'

const SingleTag = ({ technology }: { technology: string }) => {
  const data: {
    [key: string]: { name: string; color: string; icon: IconDefinition; bgColor: string }
  } = {
    react: { name: 'React', color: 'text-[#000000]', icon: faReact, bgColor: 'bg-[#61DBFB]' },
    'react native': {
      name: 'React Native',
      color: 'text-[#000000]',
      icon: faReact,
      bgColor: 'bg-[#61DBFB]',
    },
    // text/bg combos are kept at WCAG AA contrast (≥4.5:1) for the badge label.
    express: { name: 'Express', color: 'text-[#000000]', icon: faNodeJs, bgColor: 'bg-[#68A063]' },
    next: { name: 'Next.js', color: 'text-[#FFFFFF]', icon: faReact, bgColor: 'bg-[#000000]' },
    java: { name: 'Java', color: 'text-[#FFFFFF]', icon: faJava, bgColor: 'bg-[#006080]' },
    python: { name: 'Python', color: 'text-[#FFFFFF]', icon: faPython, bgColor: 'bg-[#2B5B84]' },
    c: { name: 'C', color: 'text-[#000000]', icon: faCode, bgColor: 'bg-[#A8B9CC]' },
    'c++': { name: 'C++', color: 'text-[#FFFFFF]', icon: faCode, bgColor: 'bg-[#00599C]' },
    'c#': { name: 'C#', color: 'text-[#FFFFFF]', icon: faCode, bgColor: 'bg-[#0F5C00]' },
    aws: { name: 'AWS', color: 'text-[#232F3E]', icon: faAws, bgColor: 'bg-[#FF9900]' },
    azure: { name: 'Azure', color: 'text-[#FFFFFF]', icon: faCloud, bgColor: 'bg-[#005A9E]' },
    gcp: { name: 'GCP', color: 'text-[#FFFFFF]', icon: faGoogle, bgColor: 'bg-[#1A56C4]' },
    'chrome extension': {
      name: 'Chrome Extension',
      color: 'text-[#FFFFFF]',
      icon: faChrome,
      bgColor: 'bg-[#1A56C4]',
    },
  }

  return (
    <span
      key={technology}
      className={`text-xs font-medium me-2 px-2.5 pt-0.5 pb-1 rounded flex items-center ${data[technology] ? data[technology].color : 'text-black'} ${data[technology] ? data[technology].bgColor : 'bg-[#f7f7f7]'}`}
    >
      <FontAwesomeIcon
        icon={data[technology] ? data[technology].icon : faGlobe}
        style={{
          width: '1rem',
          height: '1rem',
          marginRight: '0.25rem',
          paddingTop: '0.25rem',
        }}
      />
      <span className="text-sm hidden lg:block">
        {data[technology] ? data[technology].name : technology}
      </span>
    </span>
  )
}

export default SingleTag
