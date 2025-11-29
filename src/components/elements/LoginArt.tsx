import { Typography } from "@mui/material"

export const LoginArt = () => {
    return (
        <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-blue-500 via-indigo-600 to-purple-700 items-center justify-center p-12 relative overflow-hidden">
        {/* Decorative Elements */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-white opacity-10 rounded-full -mr-48 -mt-48"></div>
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-white opacity-10 rounded-full -ml-40 -mb-40"></div>

        <div className="relative z-10 text-white text-center max-w-lg">
          {/* Detailed SVG Illustration */}
          <div className="mb-6">
            <svg
              viewBox="0 0 600 600"
              className="w-full h-auto"
              xmlns="http://www.w3.org/2000/svg"
            >
              {/* Background elements */}
              <circle cx="100" cy="100" r="40" fill="#FCD34D" opacity="0.6" />
              <circle cx="520" cy="150" r="30" fill="#FCD34D" opacity="0.4" />
              <circle cx="150" cy="450" r="50" fill="#FCD34D" opacity="0.5" />

              {/* Laptop base */}
              <path
                d="M 150 320 L 450 320 L 470 370 Q 470 380, 460 380 L 140 380 Q 130 380, 130 370 Z"
                fill="#E5E7EB"
              />
              <path
                d="M 150 320 L 450 320 L 470 370 L 130 370 Z"
                fill="#F3F4F6"
              />

              {/* Laptop screen frame */}
              <path
                d="M 170 170 Q 170 160, 180 160 L 420 160 Q 430 160, 430 170 L 430 310 Q 430 320, 420 320 L 180 320 Q 170 320, 170 310 Z"
                fill="#1F2937"
              />

              {/* Screen content background */}
              <path
                d="M 185 180 Q 185 175, 190 175 L 410 175 Q 415 175, 415 180 L 415 305 Q 415 310, 410 310 L 190 310 Q 185 310, 185 305 Z"
                fill="#4F46E5"
              />

              {/* Login form on screen */}
              <rect x="220" y="200" width="160" height="90" rx="8" fill="#ffffff" opacity="0.95" />
              
              {/* User icon circle */}
              <circle cx="300" cy="225" r="18" fill="#4F46E5" />
              <path
                d="M 300 218 Q 306 218, 306 224 Q 306 230, 300 230 Q 294 230, 294 224 Q 294 218, 300 218"
                fill="#ffffff"
              />
              <path
                d="M 288 238 Q 288 232, 294 232 L 306 232 Q 312 232, 312 238"
                stroke="#ffffff"
                strokeWidth="2"
                fill="none"
              />

              {/* Input fields */}
              <rect x="235" y="250" width="130" height="12" rx="6" fill="#E5E7EB" />
              <rect x="245" y="252" width="40" height="8" rx="4" fill="#9CA3AF" />
              
              <rect x="235" y="268" width="130" height="12" rx="6" fill="#E5E7EB" />
              <rect x="245" y="270" width="30" height="8" rx="4" fill="#9CA3AF" />

              {/* Login button */}
              <rect x="235" y="285" width="130" height="14" rx="7" fill="#4F46E5" />

              {/* Security lock */}
              <g transform="translate(460, 150)">
                <circle cx="0" cy="0" r="35" fill="#FCD34D" />
                <path
                  d="M 0 -15 L 0 -20 Q 0 -28, -8 -28 Q -16 -28, -16 -20 L -16 -15"
                  stroke="#1F2937"
                  strokeWidth="4"
                  fill="none"
                  strokeLinecap="round"
                />
                <rect x="-18" y="-15" width="36" height="24" rx="4" fill="#1F2937" />
                <circle cx="0" cy="-3" r="4" fill="#FCD34D" />
                <rect x="-2" y="-3" width="4" height="8" fill="#FCD34D" />
              </g>

              {/* Floating checkmarks */}
              <g transform="translate(480, 280)">
                <circle cx="0" cy="0" r="20" fill="#10B981" opacity="0.9" />
                <path
                  d="M -6 0 L -2 4 L 6 -4"
                  stroke="#ffffff"
                  strokeWidth="3"
                  fill="none"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </g>

              <g transform="translate(120, 250)">
                <circle cx="0" cy="0" r="16" fill="#10B981" opacity="0.8" />
                <path
                  d="M -5 0 L -2 3 L 5 -4"
                  stroke="#ffffff"
                  strokeWidth="2.5"
                  fill="none"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </g>

              {/* Data flow lines */}
              <path
                d="M 100 200 Q 150 180, 170 200"
                stroke="#FCD34D"
                strokeWidth="3"
                fill="none"
                strokeDasharray="5,5"
                opacity="0.6"
              />
              <path
                d="M 430 240 Q 470 220, 490 240"
                stroke="#FCD34D"
                strokeWidth="3"
                fill="none"
                strokeDasharray="5,5"
                opacity="0.6"
              />
            </svg>
          </div>

          <Typography
            variant="h3"
            className="font-bold mb-4"
            style={{ fontFamily: 'Inter, sans-serif' }}
          >
            Manage Tasks Efficiently
          </Typography>
          <Typography variant="h6" className="opacity-90 leading-relaxed">
            Stay organized and boost your productivity with our powerful task
            management platform
          </Typography>
        </div>
      </div>
    )
}