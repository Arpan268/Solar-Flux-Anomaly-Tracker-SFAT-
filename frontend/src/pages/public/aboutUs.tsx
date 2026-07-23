import { Link } from 'react-router-dom';

export default function AboutUs() {
    return (
        <div className="max-w-3xl mx-auto mt-20 p-8 bg-gray-900 rounded-lg shadow-xl border border-gray-700">
            <h1 className="text-3xl font-bold mb-6 text-white text-center">About the Developer</h1>

            <div className="flex flex-col items-center text-center space-y-6">
                <div className="space-y-4">
                    <h2 className="text-2xl font-semibold text-blue-400">Arpan Halder</h2>
                    <p className="text-slate-300 leading-relaxed max-w-2xl">
                        I am a dedicated Software Engineer and a final-year Computer Science student at Maulana Abul Kalam Azad University of Technology (MAKAUT). Specializing in full-stack web development with a strong focus on the MERN stack, I am passionate about building scalable, performance-driven applications that solve complex technical challenges.
                    </p>

                    <p className="text-slate-300 leading-relaxed max-w-2xl">
                        I architected the <strong>Solar Flux Anomaly Tracker (SFAT)</strong> as a specialized platform for space weather monitoring. Built with secure role-based access control, the system allows teams to track live solar telemetry via the NOAA API, automatically detect irregular flux spikes, and seamlessly coordinate incident responses.
                    </p>
                </div>

                <div className="flex flex-wrap justify-center gap-6 mt-8">
                    <a
                        href="mailto:arpanhalderah3@gmail.com"
                        className="px-6 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition-colors font-medium shadow-lg shadow-red-600/20"
                    >
                        Email Me
                    </a>

                    <a
                        href="https://github.com/Arpan268"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-6 py-2 bg-gray-800 border border-gray-600 text-white rounded hover:bg-gray-700 transition-colors font-medium shadow-lg shadow-gray-900/50"
                    >
                        GitHub
                    </a>

                    <a
                        href="https://linkedin.com/in/arpan-halder"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors font-medium shadow-lg shadow-blue-600/20"
                    >
                        LinkedIn
                    </a>
                </div>

                <div className="pt-10">
                    <Link to="/" className="text-slate-400 hover:text-white transition-colors">
                        &larr; Back to Home
                    </Link>
                </div>
            </div>
        </div>
    );
}