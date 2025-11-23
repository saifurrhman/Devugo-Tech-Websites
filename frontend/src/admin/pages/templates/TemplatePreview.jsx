import React from 'react';
import { useParams } from 'react-router-dom';

export default function TemplatePreview() {
    const { id } = useParams();

    return (
        <div className="min-h-screen bg-gray-100 flex flex-col">
            <div className="bg-[#0f172a] text-white px-6 py-3 flex justify-between items-center shadow-md">
                <div className="font-medium">Template Preview: Monthly Newsletter</div>
                <div className="flex gap-4">
                    <div className="flex bg-gray-800 rounded p-1">
                        <button className="px-3 py-1 rounded bg-gray-700 text-white text-xs">Desktop</button>
                        <button className="px-3 py-1 rounded hover:bg-gray-700 text-gray-400 text-xs">Mobile</button>
                    </div>
                    <button className="text-sm text-gray-300 hover:text-white">Close Preview</button>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto p-8 flex justify-center">
                <div className="w-full max-w-[600px] bg-white shadow-xl min-h-[800px]">
                    {/* Mock Email Content */}
                    <div className="bg-gray-800 text-white p-8 text-center">
                        <h1 className="text-2xl font-bold">Company Logo</h1>
                    </div>
                    <div className="p-8">
                        <h2 className="text-xl font-bold mb-4 text-gray-800">Hello there!</h2>
                        <p className="text-gray-600 mb-4 leading-relaxed">
                            Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.
                        </p>
                        <div className="my-6">
                            <img src="https://via.placeholder.com/540x300" alt="Banner" className="w-full rounded" />
                        </div>
                        <p className="text-gray-600 mb-6 leading-relaxed">
                            Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.
                        </p>
                        <div className="text-center">
                            <button className="bg-blue-600 text-white px-6 py-3 rounded font-medium hover:bg-blue-700">
                                Call to Action
                            </button>
                        </div>
                    </div>
                    <div className="bg-gray-100 p-8 text-center text-xs text-gray-500">
                        <p className="mb-2">© 2024 Your Company Inc. All rights reserved.</p>
                        <p>123 Street Name, City, Country</p>
                        <div className="mt-4 flex justify-center gap-4">
                            <a href="#" className="underline">Unsubscribe</a>
                            <a href="#" className="underline">Privacy Policy</a>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
