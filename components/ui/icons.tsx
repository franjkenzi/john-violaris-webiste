import type { SVGProps } from "react";

/**
 * Minimal line-art icon set.
 *
 * Deliberately restrained per the brief's visual direction (no emoji, no
 * clip-art gavels). Every icon inherits `currentColor` and a 1.4px stroke so it
 * sits quietly next to the serif headings.
 */

const paths: Record<string, React.ReactNode> = {
  // Scales of justice — personal representation
  scales: (
    <>
      <path d="M12 3v18M8 21h8M5 7h14M12 3.5 5 7l-2.5 6h5L5 7m14 0 2.5 6h-5L19 7" />
      <path d="M2.5 13a2.5 2.5 0 0 0 5 0M16.5 13a2.5 2.5 0 0 0 5 0" />
    </>
  ),
  // Receipt — fixed fees
  receipt: (
    <>
      <path d="M5 3h14v18l-2.3-1.6L14.4 21l-2.4-1.6L9.6 21l-2.3-1.6L5 21z" />
      <path d="M9 8h6M9 12h6" />
    </>
  ),
  // Clock with history arrow — years of experience
  history: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3.5 2" />
    </>
  ),
  // Target — motivated by results
  target: (
    <>
      <circle cx="12" cy="12" r="9" />
      <circle cx="12" cy="12" r="4.5" />
      <circle cx="12" cy="12" r="0.6" fill="currentColor" stroke="none" />
    </>
  ),
  // Glass — drink & drug driving
  glass: (
    <>
      <path d="M6 3h12l-1.4 7.5a4.7 4.7 0 0 1-4.6 3.8 4.7 4.7 0 0 1-4.6-3.8Z" />
      <path d="M12 14.3V21M8.5 21h7" />
    </>
  ),
  // Counter dots — totting up / penalty points
  points: (
    <>
      <path d="M3.5 20.5 8 13l3.2 4L15 8l5.5 12.5z" />
      <circle cx="8" cy="13" r="1.2" />
      <circle cx="15" cy="8" r="1.2" />
    </>
  ),
  // Spark — special reasons
  spark: (
    <>
      <path d="M12 2.5 14 9l6.5 2-6.5 2-2 6.5-2-6.5L3.5 11 10 9Z" />
      <path d="M18.5 3.5v3M17 5h3" />
    </>
  ),
  // Speed camera — speeding
  camera: (
    <>
      <rect x="2.5" y="7" width="14" height="10" rx="1.5" />
      <path d="M16.5 11.5 21.5 9v6l-5-2.5z" />
      <circle cx="8" cy="12" r="2.6" />
    </>
  ),
  // Mobile phone
  phone: (
    <>
      <rect x="6.5" y="2.5" width="11" height="19" rx="2" />
      <path d="M10.5 5.5h3" />
      <circle cx="12" cy="18" r="0.8" fill="currentColor" stroke="none" />
    </>
  ),
  // Document — insurance / licence paperwork
  document: (
    <>
      <path d="M6 2.5h8l4 4V21a.5.5 0 0 1-.5.5h-11A.5.5 0 0 1 6 21z" />
      <path d="M14 2.5V7h4M9 12h6M9 16h4" />
    </>
  ),
  // Test tube — drug driving / specimens
  vial: (
    <>
      <path d="M9 2.5h6M10 2.5v14a2.8 2.8 0 0 0 4 0v-14" />
      <path d="M10 11.5c1.4-.9 2.6.9 4 0" />
    </>
  ),
  // Car — driving standards
  car: (
    <>
      <path d="M3 13.5 4.8 8A2 2 0 0 1 6.7 6.5h10.6A2 2 0 0 1 19.2 8L21 13.5" />
      <path d="M3 13.5h18v4a.5.5 0 0 1-.5.5H18v-1.5H6V18H3.5a.5.5 0 0 1-.5-.5z" />
      <path d="M6.5 16h.01M17.5 16h.01" />
    </>
  ),
  // Warning triangle — dangerous driving
  alert: (
    <>
      <path d="M12 3.2 22 20H2Z" />
      <path d="M12 9.5v4.5" />
      <circle cx="12" cy="16.8" r="0.7" fill="currentColor" stroke="none" />
    </>
  ),
  // Octagon — failing to stop
  stop: (
    <>
      <path d="M8.3 2.5h7.4l5.3 5.3v7.4l-5.3 5.3H8.3L3 15.2V7.8z" />
      <path d="M8.5 12h7" />
    </>
  ),
  // Shield — police station representation
  shield: (
    <>
      <path d="M12 2.5 4.5 5.5v6c0 4.4 3 8.3 7.5 10 4.5-1.7 7.5-5.6 7.5-10v-6z" />
      <path d="m9 12 2.2 2.2L15.5 10" />
    </>
  ),
  // Handset — call
  call: (
    <path d="M6.5 3h3l1.5 4-2 1.5a12 12 0 0 0 6.5 6.5l1.5-2 4 1.5v3a2 2 0 0 1-2.2 2A17.5 17.5 0 0 1 4.5 5.2 2 2 0 0 1 6.5 3Z" />
  ),
  // Envelope
  mail: (
    <>
      <rect x="2.5" y="5" width="19" height="14" rx="1.5" />
      <path d="m3 6.5 9 6.5 9-6.5" />
    </>
  ),
  // Calendar — booking
  calendar: (
    <>
      <rect x="3" y="5" width="18" height="16" rx="1.5" />
      <path d="M3 10h18M8 3v4M16 3v4" />
    </>
  ),
  check: <path d="m4.5 12.5 5 5 10-11" />,
  arrowRight: <path d="M4 12h15m-5.5-5.5L19.5 12l-6 5.5" />,
  menu: <path d="M3.5 7h17M3.5 12h17M3.5 17h17" />,
  close: <path d="M5.5 5.5l13 13M18.5 5.5l-13 13" />,
  whatsapp: (
    <>
      <path d="M3.2 20.8 4.6 16A8.6 8.6 0 1 1 8 19.4z" />
      <path d="M8.9 8.2c.6-.1.8.1 1 .5l.6 1.3c.1.3.1.5-.1.7l-.5.6c-.2.2-.2.4-.1.6a6 6 0 0 0 2.6 2.4c.2.1.4 0 .6-.1l.6-.6c.2-.2.4-.2.7-.1l1.3.6c.4.2.5.4.4 1" />
    </>
  ),
};

export type IconName = keyof typeof paths;

type IconProps = SVGProps<SVGSVGElement> & {
  name: IconName;
  /** Rendered size in px. */
  size?: number;
};

export function Icon({ name, size = 20, ...props }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      width={size}
      height={size}
      fill="none"
      stroke="currentColor"
      strokeWidth={1.4}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
      {...props}
    >
      {paths[name]}
    </svg>
  );
}
