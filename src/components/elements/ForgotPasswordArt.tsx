import { Typography } from "@mui/material"

export const ForgotPasswordArt = () => {
    return (
        <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-orange-500 via-red-600 to-pink-700 items-center justify-center p-12 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-white opacity-10 rounded-full -mr-48 -mt-48"></div>
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-white opacity-10 rounded-full -ml-40 -mb-40"></div>

        <div className="relative z-10 text-white text-center max-w-lg">
          <div className="mb-8">
            <svg
              viewBox="0 0 500 500"
              className="w-full h-auto"
              xmlns="http://www.w3.org/2000/svg"
            >
              {/* Shield with lock */}
              <path
                d="M 250 100 L 350 140 L 350 250 Q 350 320, 250 380 Q 150 320, 150 250 L 150 140 Z"
                fill="#ffffff"
                opacity="0.9"
              />
              {/* Lock */}
              <circle cx="250" cy="230" r="25" fill="#F97316" />
              <path
                d="M 250 210 L 250 200 Q 250 180, 230 180 Q 210 180, 210 200 L 210 210"
                stroke="#1F2937"
                strokeWidth="4"
                fill="none"
              />
              <rect x="220" y="210" width="60" height="40" rx="5" fill="#1F2937" />
              {/* Key hole */}
              <circle cx="250" cy="225" r="5" fill="#ffffff" />
              <rect x="247" y="225" width="6" height="12" fill="#ffffff" />
            </svg>
          </div>

          <Typography variant="h3" className="font-bold mb-4">
            Secure Password Reset
          </Typography>
          <Typography variant="h6" className="opacity-90 leading-relaxed">
            We'll help you get back into your account safely and securely
          </Typography>
        </div>
      </div>
    )
}