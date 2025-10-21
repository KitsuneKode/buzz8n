'use client'

import { Provider } from '@/lib/types/credentials'
import { useState } from 'react'

interface ProviderPickerProps {
  onSelect: (provider: Provider) => void
}

interface ProviderOption {
  id: Provider
  name: string
  description: string
  icon: React.ReactNode
  color: string
}

const providers: ProviderOption[] = [
  {
    id: 'Telegram',
    name: 'Telegram',
    description: 'Send messages via Telegram Bot API',
    color: 'bg-zinc-900',
    icon: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        shapeRendering="geometricPrecision"
        textRendering="geometricPrecision"
        imageRendering="optimizeQuality"
        fillRule="evenodd"
        clipRule="evenodd"
        viewBox="0 0 512 512"
      >
        <defs>
          <linearGradient
            id="prefix__a"
            gradientUnits="userSpaceOnUse"
            x1="256"
            y1="3.84"
            x2="256"
            y2="512"
          >
            <stop offset="0" stopColor="#2AABEE" />
            <stop offset="1" stopColor="#229ED9" />
          </linearGradient>
        </defs>
        <circle fill="url(#prefix__a)" cx="256" cy="256" r="256" />
        <path
          fill="#fff"
          d="M115.88 253.3c74.63-32.52 124.39-53.95 149.29-64.31 71.1-29.57 85.87-34.71 95.5-34.88 2.12-.03 6.85.49 9.92 2.98 2.59 2.1 3.3 4.94 3.64 6.93.34 2 .77 6.53.43 10.08-3.85 40.48-20.52 138.71-29 184.05-3.59 19.19-10.66 25.62-17.5 26.25-14.86 1.37-26.15-9.83-40.55-19.27-22.53-14.76-35.26-23.96-57.13-38.37-25.28-16.66-8.89-25.81 5.51-40.77 3.77-3.92 69.27-63.5 70.54-68.9.16-.68.31-3.2-1.19-4.53s-3.71-.87-5.3-.51c-2.26.51-38.25 24.3-107.98 71.37-10.22 7.02-19.48 10.43-27.77 10.26-9.14-.2-26.72-5.17-39.79-9.42-16.03-5.21-28.77-7.97-27.66-16.82.57-4.61 6.92-9.32 19.04-14.14z"
        />
      </svg>
    ),
  },
  {
    id: 'Email',
    name: 'Email (Resend)',
    description: 'Send emails via Resend API',
    color: 'bg-zinc-900',
    icon: (
      <svg
        className="inline-block w-12"
        fill="none"
        viewBox="0 0 78 78"
        width="40"
        xmlns="http://www.w3.org/2000/svg"
      >
        <rect
          x="1"
          y="1"
          width="76"
          height="76"
          rx="21"
          stroke="#FDFDFD"
          strokeOpacity="0.1"
          strokeWidth="2"
        ></rect>
        <path
          d="M43.0184 21C49.9908 21 54.1374 25.1467 54.1374 30.6513C54.1374 36.1558 49.9908 40.3025 43.0184 40.3025H39.4953L57 57H44.6329L31.3118 44.3394C30.3578 43.4587 29.9174 42.4312 29.9174 41.5506C29.9174 40.3029 30.7984 39.202 32.4864 38.7249L39.3485 36.8897C41.954 36.1925 43.7522 34.1741 43.7522 31.5319C43.7522 28.3027 41.1098 26.4312 37.8438 26.4312H21V21H43.0184Z"
          fill="url(#paint0_linear_1382_599)"
        ></path>
        <path
          d="M54.1375 30.6513C54.1374 25.1467 49.9908 21 43.0184 21V20.55C46.5934 20.55 49.4879 21.6142 51.4941 23.4275C53.4405 25.1867 54.5189 27.6229 54.5844 30.3832L54.5875 30.6513C54.5875 33.5218 53.5032 36.0591 51.4941 37.875C49.5505 39.6317 46.7734 40.6853 43.3515 40.7495L43.0184 40.7525H40.619L58.1237 57.45H44.4532L44.3231 57.3261L31.0064 44.6694C29.978 43.7199 29.4675 42.579 29.4674 41.5506C29.4674 40.0491 30.5379 38.8082 32.3643 38.292L32.37 38.2903L39.2321 36.4551C41.6742 35.8016 43.3023 33.9377 43.3023 31.5319C43.3023 30.0523 42.7022 28.9051 41.7383 28.1191C40.7652 27.3258 39.3949 26.8812 37.8438 26.8812H20.55V20.55H43.0184V21H21V26.4312H37.8438C41.1098 26.4312 43.7522 28.3027 43.7523 31.5319C43.7523 34.1741 41.954 36.1925 39.3485 36.8897L32.4865 38.7249C30.7984 39.202 29.9174 40.3029 29.9174 41.5506C29.9175 42.4312 30.3578 43.4587 31.3118 44.3393L44.633 57H57.0001L39.4953 40.3025H43.0184C49.9909 40.3025 54.1375 36.1558 54.1375 30.6513Z"
          fill="url(#paint1_linear_1382_599)"
        ></path>
        <defs>
          <linearGradient
            id="paint0_linear_1382_599"
            x1="39"
            y1="21"
            x2="58.1887"
            y2="56.4242"
            gradientUnits="userSpaceOnUse"
          >
            <stop stopColor="#FDFDFD"></stop>
            <stop offset="1" stopColor="#ADADAD"></stop>
          </linearGradient>
          <linearGradient
            id="paint1_linear_1382_599"
            x1="39.3369"
            y1="20.55"
            x2="58.8097"
            y2="57.1549"
            gradientUnits="userSpaceOnUse"
          >
            <stop stopColor="#FDFDFD"></stop>
            <stop offset="1" stopColor="#ADADAD"></stop>
          </linearGradient>
        </defs>
      </svg>
    ),
  },
  {
    id: 'OpenAI',
    name: 'OpenAI',
    description: 'Access OpenAI GPT models',
    color: 'bg-emerald-600',
    icon: (
      <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
        <path d="M22.282 9.821a5.985 5.985 0 0 0-.516-4.91 6.046 6.046 0 0 0-6.51-2.9A6.065 6.065 0 0 0 4.981 4.18a5.985 5.985 0 0 0-3.998 2.9 6.046 6.046 0 0 0 .743 7.097 5.98 5.98 0 0 0 .51 4.911 6.051 6.051 0 0 0 6.515 2.9A5.985 5.985 0 0 0 13.26 24a6.056 6.056 0 0 0 5.772-4.206 5.99 5.99 0 0 0 3.997-2.9 6.056 6.056 0 0 0-.747-7.073zM13.26 22.43a4.476 4.476 0 0 1-2.876-1.04l.141-.081 4.779-2.758a.795.795 0 0 0 .392-.681v-6.737l2.02 1.168a.071.071 0 0 1 .038.052v5.583a4.504 4.504 0 0 1-4.494 4.494zM3.6 18.304a4.47 4.47 0 0 1-.535-3.014l.142.085 4.783 2.759a.771.771 0 0 0 .78 0l5.843-3.369v2.332a.08.08 0 0 1-.033.062L9.74 19.95a4.5 4.5 0 0 1-6.14-1.646zM2.34 7.896a4.485 4.485 0 0 1 2.366-1.973V11.6a.766.766 0 0 0 .388.676l5.815 3.355-2.02 1.168a.076.076 0 0 1-.071 0l-4.83-2.786A4.504 4.504 0 0 1 2.34 7.872zm16.597 3.855l-5.833-3.387L15.119 7.2a.076.076 0 0 1 .071 0l4.83 2.791a4.494 4.494 0 0 1-.676 8.105v-5.678a.79.79 0 0 0-.407-.667zm2.01-3.023l-.141-.085-4.774-2.782a.776.776 0 0 0-.785 0L9.409 9.23V6.897a.066.066 0 0 1 .028-.061l4.83-2.787a4.5 4.5 0 0 1 6.68 4.66zm-12.64 4.135l-2.02-1.164a.08.08 0 0 1-.038-.057V6.075a4.5 4.5 0 0 1 7.375-3.453l-.142.08L8.704 5.46a.795.795 0 0 0-.393.681zm1.097-2.365l2.602-1.5 2.607 1.5v2.999l-2.597 1.5-2.607-1.5z" />
      </svg>
    ),
  },
  {
    id: 'Gemini',
    name: 'Gemini',
    description: 'Access Google Gemini AI models',
    color: 'bg-zinc-900',
    icon: (
      <svg fill="none" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 65 65">
        <mask
          id="maskme"
          style={{ maskType: 'alpha' }}
          maskUnits="userSpaceOnUse"
          x="0"
          y="0"
          width="65"
          height="65"
        >
          <path
            d="M32.447 0c.68 0 1.273.465 1.439 1.125a38.904 38.904 0 001.999 5.905c2.152 5 5.105 9.376 8.854 13.125 3.751 3.75 8.126 6.703 13.125 8.855a38.98 38.98 0 005.906 1.999c.66.166 1.124.758 1.124 1.438 0 .68-.464 1.273-1.125 1.439a38.902 38.902 0 00-5.905 1.999c-5 2.152-9.375 5.105-13.125 8.854-3.749 3.751-6.702 8.126-8.854 13.125a38.973 38.973 0 00-2 5.906 1.485 1.485 0 01-1.438 1.124c-.68 0-1.272-.464-1.438-1.125a38.913 38.913 0 00-2-5.905c-2.151-5-5.103-9.375-8.854-13.125-3.75-3.749-8.125-6.702-13.125-8.854a38.973 38.973 0 00-5.905-2A1.485 1.485 0 010 32.448c0-.68.465-1.272 1.125-1.438a38.903 38.903 0 005.905-2c5-2.151 9.376-5.104 13.125-8.854 3.75-3.749 6.703-8.125 8.855-13.125a38.972 38.972 0 001.999-5.905A1.485 1.485 0 0132.447 0z"
            fill="#000"
          />
          <path
            d="M32.447 0c.68 0 1.273.465 1.439 1.125a38.904 38.904 0 001.999 5.905c2.152 5 5.105 9.376 8.854 13.125 3.751 3.75 8.126 6.703 13.125 8.855a38.98 38.98 0 005.906 1.999c.66.166 1.124.758 1.124 1.438 0 .68-.464 1.273-1.125 1.439a38.902 38.902 0 00-5.905 1.999c-5 2.152-9.375 5.105-13.125 8.854-3.749 3.751-6.702 8.126-8.854 13.125a38.973 38.973 0 00-2 5.906 1.485 1.485 0 01-1.438 1.124c-.68 0-1.272-.464-1.438-1.125a38.913 38.913 0 00-2-5.905c-2.151-5-5.103-9.375-8.854-13.125-3.75-3.749-8.125-6.702-13.125-8.854a38.973 38.973 0 00-5.905-2A1.485 1.485 0 010 32.448c0-.68.465-1.272 1.125-1.438a38.903 38.903 0 005.905-2c5-2.151 9.376-5.104 13.125-8.854 3.75-3.749 6.703-8.125 8.855-13.125a38.972 38.972 0 001.999-5.905A1.485 1.485 0 0132.447 0z"
            fill="url(#prefix__paint0_linear_2001_67)"
          />
        </mask>
        <g mask="url(#maskme)">
          <g filter="url(#prefix__filter0_f_2001_67)">
            <path
              d="M-5.859 50.734c7.498 2.663 16.116-2.33 19.249-11.152 3.133-8.821-.406-18.131-7.904-20.794-7.498-2.663-16.116 2.33-19.25 11.151-3.132 8.822.407 18.132 7.905 20.795z"
              fill="#FFE432"
            />
          </g>
          <g filter="url(#prefix__filter1_f_2001_67)">
            <path
              d="M27.433 21.649c10.3 0 18.651-8.535 18.651-19.062 0-10.528-8.35-19.062-18.651-19.062S8.78-7.94 8.78 2.587c0 10.527 8.35 19.062 18.652 19.062z"
              fill="#FC413D"
            />
          </g>
          <g filter="url(#prefix__filter2_f_2001_67)">
            <path
              d="M20.184 82.608c10.753-.525 18.918-12.244 18.237-26.174-.68-13.93-9.95-24.797-20.703-24.271C6.965 32.689-1.2 44.407-.519 58.337c.681 13.93 9.95 24.797 20.703 24.271z"
              fill="#00B95C"
            />
          </g>
          <g filter="url(#prefix__filter3_f_2001_67)">
            <path
              d="M20.184 82.608c10.753-.525 18.918-12.244 18.237-26.174-.68-13.93-9.95-24.797-20.703-24.271C6.965 32.689-1.2 44.407-.519 58.337c.681 13.93 9.95 24.797 20.703 24.271z"
              fill="#00B95C"
            />
          </g>
          <g filter="url(#prefix__filter4_f_2001_67)">
            <path
              d="M30.954 74.181c9.014-5.485 11.427-17.976 5.389-27.9-6.038-9.925-18.241-13.524-27.256-8.04-9.015 5.486-11.428 17.977-5.39 27.902 6.04 9.924 18.242 13.523 27.257 8.038z"
              fill="#00B95C"
            />
          </g>
          <g filter="url(#prefix__filter5_f_2001_67)">
            <path
              d="M67.391 42.993c10.132 0 18.346-7.91 18.346-17.666 0-9.757-8.214-17.667-18.346-17.667s-18.346 7.91-18.346 17.667c0 9.757 8.214 17.666 18.346 17.666z"
              fill="#3186FF"
            />
          </g>
          <g filter="url(#prefix__filter6_f_2001_67)">
            <path
              d="M-13.065 40.944c9.33 7.094 22.959 4.869 30.442-4.972 7.483-9.84 5.987-23.569-3.343-30.663C4.704-1.786-8.924.439-16.408 10.28c-7.483 9.84-5.986 23.57 3.343 30.664z"
              fill="#FBBC04"
            />
          </g>
          <g filter="url(#prefix__filter7_f_2001_67)">
            <path
              d="M34.74 51.43c11.135 7.656 25.896 5.524 32.968-4.764 7.073-10.287 3.779-24.832-7.357-32.488C49.215 6.52 34.455 8.654 27.382 18.94c-7.072 10.288-3.779 24.833 7.357 32.49z"
              fill="#3186FF"
            />
          </g>
          <g filter="url(#prefix__filter8_f_2001_67)">
            <path
              d="M54.984-2.336c2.833 3.852-.808 11.34-8.131 16.727-7.324 5.387-15.557 6.631-18.39 2.78-2.833-3.853.807-11.342 8.13-16.728 7.324-5.387 15.558-6.631 18.39-2.78z"
              fill="#749BFF"
            />
          </g>
          <g filter="url(#prefix__filter9_f_2001_67)">
            <path
              d="M31.727 16.104C43.053 5.598 46.94-8.626 40.41-15.666c-6.53-7.04-21.006-4.232-32.332 6.274s-15.214 24.73-8.683 31.77c6.53 7.04 21.006 4.232 32.332-6.274z"
              fill="#FC413D"
            />
          </g>
          <g filter="url(#prefix__filter10_f_2001_67)">
            <path
              d="M8.51 53.838c6.732 4.818 14.46 5.55 17.262 1.636 2.802-3.915-.384-10.994-7.116-15.812-6.731-4.818-14.46-5.55-17.261-1.636-2.802 3.915.383 10.994 7.115 15.812z"
              fill="#FFEE48"
            />
          </g>
        </g>
        <defs>
          <filter
            id="prefix__filter0_f_2001_67"
            x="-19.824"
            y="13.152"
            width="39.274"
            height="43.217"
            filterUnits="userSpaceOnUse"
            colorInterpolationFilters="sRGB"
          >
            <feFlood floodOpacity="0" result="BackgroundImageFix" />
            <feBlend in="SourceGraphic" in2="BackgroundImageFix" result="shape" />
            <feGaussianBlur stdDeviation="2.46" result="effect1_foregroundBlur_2001_67" />
          </filter>
          <filter
            id="prefix__filter1_f_2001_67"
            x="-15.001"
            y="-40.257"
            width="84.868"
            height="85.688"
            filterUnits="userSpaceOnUse"
            colorInterpolationFilters="sRGB"
          >
            <feFlood floodOpacity="0" result="BackgroundImageFix" />
            <feBlend in="SourceGraphic" in2="BackgroundImageFix" result="shape" />
            <feGaussianBlur stdDeviation="11.891" result="effect1_foregroundBlur_2001_67" />
          </filter>
          <filter
            id="prefix__filter2_f_2001_67"
            x="-20.776"
            y="11.927"
            width="79.454"
            height="90.916"
            filterUnits="userSpaceOnUse"
            colorInterpolationFilters="sRGB"
          >
            <feFlood floodOpacity="0" result="BackgroundImageFix" />
            <feBlend in="SourceGraphic" in2="BackgroundImageFix" result="shape" />
            <feGaussianBlur stdDeviation="10.109" result="effect1_foregroundBlur_2001_67" />
          </filter>
          <filter
            id="prefix__filter3_f_2001_67"
            x="-20.776"
            y="11.927"
            width="79.454"
            height="90.916"
            filterUnits="userSpaceOnUse"
            colorInterpolationFilters="sRGB"
          >
            <feFlood floodOpacity="0" result="BackgroundImageFix" />
            <feBlend in="SourceGraphic" in2="BackgroundImageFix" result="shape" />
            <feGaussianBlur stdDeviation="10.109" result="effect1_foregroundBlur_2001_67" />
          </filter>
          <filter
            id="prefix__filter4_f_2001_67"
            x="-19.845"
            y="15.459"
            width="79.731"
            height="81.505"
            filterUnits="userSpaceOnUse"
            colorInterpolationFilters="sRGB"
          >
            <feFlood floodOpacity="0" result="BackgroundImageFix" />
            <feBlend in="SourceGraphic" in2="BackgroundImageFix" result="shape" />
            <feGaussianBlur stdDeviation="10.109" result="effect1_foregroundBlur_2001_67" />
          </filter>
          <filter
            id="prefix__filter5_f_2001_67"
            x="29.832"
            y="-11.552"
            width="75.117"
            height="73.758"
            filterUnits="userSpaceOnUse"
            colorInterpolationFilters="sRGB"
          >
            <feFlood floodOpacity="0" result="BackgroundImageFix" />
            <feBlend in="SourceGraphic" in2="BackgroundImageFix" result="shape" />
            <feGaussianBlur stdDeviation="9.606" result="effect1_foregroundBlur_2001_67" />
          </filter>
          <filter
            id="prefix__filter6_f_2001_67"
            x="-38.583"
            y="-16.253"
            width="78.135"
            height="78.758"
            filterUnits="userSpaceOnUse"
            colorInterpolationFilters="sRGB"
          >
            <feFlood floodOpacity="0" result="BackgroundImageFix" />
            <feBlend in="SourceGraphic" in2="BackgroundImageFix" result="shape" />
            <feGaussianBlur stdDeviation="8.706" result="effect1_foregroundBlur_2001_67" />
          </filter>
          <filter
            id="prefix__filter7_f_2001_67"
            x="8.107"
            y="-5.966"
            width="78.877"
            height="77.539"
            filterUnits="userSpaceOnUse"
            colorInterpolationFilters="sRGB"
          >
            <feFlood floodOpacity="0" result="BackgroundImageFix" />
            <feBlend in="SourceGraphic" in2="BackgroundImageFix" result="shape" />
            <feGaussianBlur stdDeviation="7.775" result="effect1_foregroundBlur_2001_67" />
          </filter>
          <filter
            id="prefix__filter8_f_2001_67"
            x="13.587"
            y="-18.488"
            width="56.272"
            height="51.81"
            filterUnits="userSpaceOnUse"
            colorInterpolationFilters="sRGB"
          >
            <feFlood floodOpacity="0" result="BackgroundImageFix" />
            <feBlend in="SourceGraphic" in2="BackgroundImageFix" result="shape" />
            <feGaussianBlur stdDeviation="6.957" result="effect1_foregroundBlur_2001_67" />
          </filter>
          <filter
            id="prefix__filter9_f_2001_67"
            x="-15.526"
            y="-31.297"
            width="70.856"
            height="69.306"
            filterUnits="userSpaceOnUse"
            colorInterpolationFilters="sRGB"
          >
            <feFlood floodOpacity="0" result="BackgroundImageFix" />
            <feBlend in="SourceGraphic" in2="BackgroundImageFix" result="shape" />
            <feGaussianBlur stdDeviation="5.876" result="effect1_foregroundBlur_2001_67" />
          </filter>
          <filter
            id="prefix__filter10_f_2001_67"
            x="-14.168"
            y="20.964"
            width="55.501"
            height="51.571"
            filterUnits="userSpaceOnUse"
            colorInterpolationFilters="sRGB"
          >
            <feFlood floodOpacity="0" result="BackgroundImageFix" />
            <feBlend in="SourceGraphic" in2="BackgroundImageFix" result="shape" />
            <feGaussianBlur stdDeviation="7.273" result="effect1_foregroundBlur_2001_67" />
          </filter>
          <linearGradient
            id="prefix__paint0_linear_2001_67"
            x1="18.447"
            y1="43.42"
            x2="52.153"
            y2="15.004"
            gradientUnits="userSpaceOnUse"
          >
            <stop stopColor="#4893FC" />
            <stop offset=".27" stopColor="#4893FC" />
            <stop offset=".777" stopColor="#969DFF" />
            <stop offset="1" stopColor="#BD99FE" />
          </linearGradient>
        </defs>
      </svg>
    ),
  },
  {
    id: 'Anthropic',
    name: 'Claude',
    description: 'Access Anthropic Claude AI models',
    color: 'bg-orange-600',
    icon: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        shapeRendering="geometricPrecision"
        textRendering="geometricPrecision"
        imageRendering="optimizeQuality"
        fillRule="evenodd"
        clipRule="evenodd"
        viewBox="0 0 512 509.64"
      >
        <path
          fill="#D77655"
          d="M115.612 0h280.775C459.974 0 512 52.026 512 115.612v278.415c0 63.587-52.026 115.612-115.613 115.612H115.612C52.026 509.639 0 457.614 0 394.027V115.612C0 52.026 52.026 0 115.612 0z"
        />
        <path
          fill="#FCF2EE"
          fillRule="nonzero"
          d="M142.27 316.619l73.655-41.326 1.238-3.589-1.238-1.996-3.589-.001-12.31-.759-42.084-1.138-36.498-1.516-35.361-1.896-8.897-1.895-8.34-10.995.859-5.484 7.482-5.03 10.717.935 23.683 1.617 35.537 2.452 25.782 1.517 38.193 3.968h6.064l.86-2.451-2.073-1.517-1.618-1.517-36.776-24.922-39.81-26.338-20.852-15.166-11.273-7.683-5.687-7.204-2.451-15.721 10.237-11.273 13.75.935 3.513.936 13.928 10.716 29.749 23.027 38.848 28.612 5.687 4.727 2.275-1.617.278-1.138-2.553-4.271-21.13-38.193-22.546-38.848-10.035-16.101-2.654-9.655c-.935-3.968-1.617-7.304-1.617-11.374l11.652-15.823 6.445-2.073 15.545 2.073 6.547 5.687 9.655 22.092 15.646 34.78 24.265 47.291 7.103 14.028 3.791 12.992 1.416 3.968 2.449-.001v-2.275l1.997-26.641 3.69-32.707 3.589-42.084 1.239-11.854 5.863-14.206 11.652-7.683 9.099 4.348 7.482 10.716-1.036 6.926-4.449 28.915-8.72 45.294-5.687 30.331h3.313l3.792-3.791 15.342-20.372 25.782-32.227 11.374-12.789 13.27-14.129 8.517-6.724 16.1-.001 11.854 17.617-5.307 18.199-16.581 21.029-13.75 17.819-19.716 26.54-12.309 21.231 1.138 1.694 2.932-.278 44.536-9.479 24.062-4.347 28.714-4.928 12.992 6.066 1.416 6.167-5.106 12.613-30.71 7.583-36.018 7.204-53.636 12.689-.657.48.758.935 24.164 2.275 10.337.556h25.301l47.114 3.514 12.309 8.139 7.381 9.959-1.238 7.583-18.957 9.655-25.579-6.066-59.702-14.205-20.474-5.106-2.83-.001v1.694l17.061 16.682 31.266 28.233 39.152 36.397 1.997 8.999-5.03 7.102-5.307-.758-34.401-25.883-13.27-11.651-30.053-25.302-1.996-.001v2.654l6.926 10.136 36.574 54.975 1.895 16.859-2.653 5.485-9.479 3.311-10.414-1.895-21.408-30.054-22.092-33.844-17.819-30.331-2.173 1.238-10.515 113.261-4.929 5.788-11.374 4.348-9.478-7.204-5.03-11.652 5.03-23.027 6.066-30.052 4.928-23.886 4.449-29.674 2.654-9.858-.177-.657-2.173.278-22.37 30.71-34.021 45.977-26.919 28.815-6.445 2.553-11.173-5.789 1.037-10.337 6.243-9.2 37.257-47.392 22.47-29.371 14.508-16.961-.101-2.451h-.859l-98.954 64.251-17.618 2.275-7.583-7.103.936-11.652 3.589-3.791 29.749-20.474-.101.102.024.101z"
        />
      </svg>
    ),
  },

  {
    id: 'Discord',
    name: 'Discord',
    description: 'Send messages to Discord channels',
    color: 'bg-indigo-600',
    icon: (
      <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
        <path d="M20.317 4.3698a19.7913 19.7913 0 00-4.8851-1.5152.0741.0741 0 00-.0785.0371c-.211.3753-.4447.8648-.6083 1.2495-1.8447-.2762-3.68-.2762-5.4868 0-.1636-.3933-.4058-.8742-.6177-1.2495a.077.077 0 00-.0785-.037 19.7363 19.7363 0 00-4.8852 1.515.0699.0699 0 00-.0321.0277C.5334 9.0458-.319 13.5799.0992 18.0578a.0824.0824 0 00.0312.0561c2.0528 1.5076 4.0413 2.4228 5.9929 3.0294a.0777.0777 0 00.0842-.0276c.4616-.6304.8731-1.2952 1.226-1.9942a.076.076 0 00-.0416-.1057c-.6528-.2476-1.2743-.5495-1.8722-.8923a.077.077 0 01-.0076-.1277c.1258-.0943.2517-.1923.3718-.2914a.0743.0743 0 01.0776-.0105c3.9278 1.7933 8.18 1.7933 12.0614 0a.0739.0739 0 01.0785.0095c.1202.099.246.1981.3728.2924a.077.077 0 01-.0066.1276 12.2986 12.2986 0 01-1.873.8914.0766.0766 0 00-.0407.1067c.3604.698.7719 1.3628 1.225 1.9932a.076.076 0 00.0842.0286c1.961-.6067 3.9495-1.5219 6.0023-3.0294a.077.077 0 00.0313-.0552c.5004-5.177-.8382-9.6739-3.5485-13.6604a.061.061 0 00-.0312-.0286zM8.02 15.3312c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9555-2.4189 2.157-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419-.0002 1.3332-.9555 2.4189-2.1569 2.4189zm7.9748 0c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9554-2.4189 2.1569-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.9555 2.4189-2.1568 2.4189Z" />
      </svg>
    ),
  },
  {
    id: 'Slack',
    name: 'Slack',
    description: 'Send messages via Slack Bot API',
    color: 'bg-pink-600',
    icon: (
      <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
        <path d="M5.042 15.165a2.528 2.528 0 0 1-2.52 2.523A2.528 2.528 0 0 1 0 15.165a2.527 2.527 0 0 1 2.522-2.52h2.52v2.52zM6.313 15.165a2.527 2.527 0 0 1 2.521-2.52 2.527 2.527 0 0 1 2.521 2.52v6.313A2.528 2.528 0 0 1 8.834 24a2.528 2.528 0 0 1-2.521-2.522v-6.313zM8.834 5.042a2.528 2.528 0 0 1-2.521-2.52A2.528 2.528 0 0 1 8.834 0a2.528 2.528 0 0 1 2.521 2.522v2.52H8.834zM8.834 6.313a2.528 2.528 0 0 1 2.521 2.521 2.528 2.528 0 0 1-2.521 2.521H2.522A2.528 2.528 0 0 1 0 8.834a2.528 2.528 0 0 1 2.522-2.521h6.312zM18.956 8.834a2.528 2.528 0 0 1 2.522-2.521A2.528 2.528 0 0 1 24 8.834a2.528 2.528 0 0 1-2.522 2.521h-2.522V8.834zM17.688 8.834a2.528 2.528 0 0 1-2.523 2.521 2.527 2.527 0 0 1-2.52-2.521V2.522A2.527 2.527 0 0 1 15.165 0a2.528 2.528 0 0 1 2.523 2.522v6.312zM15.165 18.956a2.528 2.528 0 0 1 2.523 2.522A2.528 2.528 0 0 1 15.165 24a2.527 2.527 0 0 1-2.52-2.522v-2.522h2.52zM15.165 17.688a2.527 2.527 0 0 1-2.52-2.523 2.526 2.526 0 0 1 2.52-2.52h6.313A2.527 2.527 0 0 1 24 15.165a2.528 2.528 0 0 1-2.522 2.523h-6.313z" />
      </svg>
    ),
  },
]

export const getProviderIcon = (provider: Provider) => {
  return (
    providers.find((p) => p.id === provider)?.icon ?? (
      <span className="text-white text-sm font-bold uppercase">
        {provider?.charAt(0).toUpperCase() + provider?.charAt(1).toLowerCase()}
      </span>
    )
  )
}

const ProviderPicker = ({ onSelect }: ProviderPickerProps) => {
  const [searchTerm, setSearchTerm] = useState('')

  const filteredProviders = providers.filter(
    (provider) =>
      provider.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      provider.description.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  return (
    <div className="p-6">
      <div className="mb-6">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <svg
              className="h-5 w-5 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </div>
          <input
            type="text"
            placeholder="Search providers..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="block w-full pl-10 pr-3 py-2 border border-gray-600 rounded-lg bg-gray-700 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-96 overflow-y-auto">
        {filteredProviders.map((provider) => (
          <button
            key={provider.id}
            onClick={() => onSelect(provider.id)}
            className="flex items-start space-x-4 p-4 border border-gray-600 rounded-lg hover:border-gray-500 hover:bg-gray-750 transition-colors text-left group"
          >
            <div
              className={`flex-shrink-0 w-10 h-10 ${provider.color} rounded-lg flex items-center justify-center text-white group-hover:scale-105 transition-transform`}
            >
              {provider.icon}
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-sm font-medium text-white group-hover:text-blue-300 transition-colors">
                {provider.name}
              </h3>
              <p className="text-xs text-gray-400 mt-1 line-clamp-2">{provider.description}</p>
            </div>
          </button>
        ))}
      </div>

      {filteredProviders.length === 0 && (
        <div className="text-center py-12">
          <svg
            className="w-12 h-12 text-gray-600 mx-auto mb-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
          <p className="text-gray-400">No providers found matching your search.</p>
        </div>
      )}
    </div>
  )
}

export default ProviderPicker
