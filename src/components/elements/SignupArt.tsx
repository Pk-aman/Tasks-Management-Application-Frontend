import { Typography } from "@mui/material"

export const SignupArt = () => {
    return (
        <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-emerald-500 via-teal-600 to-cyan-700 items-center justify-center p-12 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-96 h-96 bg-white opacity-10 rounded-full -ml-48 -mt-48"></div>
        <div className="absolute bottom-0 right-0 w-80 h-80 bg-white opacity-10 rounded-full -mr-40 -mb-40"></div>

        <div className="relative z-10 text-white text-center max-w-lg">
          <div className="mb-8">
            <svg
              viewBox="0 0 500 500"
              className="w-full h-auto"
              xmlns="http://www.w3.org/2000/svg"
            >
              {/* Person with checklist */}
              <circle cx="250" cy="180" r="60" fill="#ffffff" opacity="0.9" />
              <path
                d="M 250 240 Q 200 260, 180 320 L 320 320 Q 300 260, 250 240"
                fill="#ffffff"
                opacity="0.9"
              />
              {/* Checklist */}
              <rect x="320" y="150" width="100" height="150" rx="8" fill="#ffffff" />
              <rect x="330" y="170" width="15" height="15" rx="3" fill="#10B981" />
              <rect x="350" y="172" width="50" height="3" rx="1.5" fill="#6B7280" />
              <rect x="330" y="200" width="15" height="15" rx="3" fill="#10B981" />
              <rect x="350" y="202" width="50" height="3" rx="1.5" fill="#6B7280" />
              <rect x="330" y="230" width="15" height="15" rx="3" fill="#E5E7EB" />
              <rect x="350" y="232" width="50" height="3" rx="1.5" fill="#6B7280" />
              {/* Stars */}
              <circle cx="150" cy="100" r="8" fill="#FCD34D" />
              <circle cx="380" cy="120" r="6" fill="#FCD34D" />
              <circle cx="140" cy="280" r="10" fill="#FCD34D" />
            </svg>
          </div>

          <Typography variant="h3" className="font-bold mb-4">
            Start Your Journey
          </Typography>
          <Typography variant="h6" className="opacity-90 leading-relaxed">
            Join thousands of users managing their tasks efficiently
          </Typography>

        </div>
      </div>
    )
}