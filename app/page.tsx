'use client';

export const dynamic = "force-dynamic";

import React, { useState, useEffect, ChangeEvent, useRef, useCallback, useMemo } from 'react';
import { IoFlaskSharp } from 'react-icons/io5';
import { FaMoneyBillWave, FaFile } from 'react-icons/fa';
import { AiFillThunderbolt, AiOutlineLoading3Quarters } from 'react-icons/ai';
import { MdContentCopy, MdClose } from 'react-icons/md';
import { BsClipboard2Check } from 'react-icons/bs';
import { HiMiniCheckBadge } from 'react-icons/hi2';
import { generate } from './actions';
import { unstable_noStore as noStore } from 'next/cache';
import { readStreamableValue } from 'ai/rsc';

interface Generation {
  score: number;
  strengths: string[];
  feedbacks: string[];
}


const ResumeReview: React.FC = () => {
    noStore();
  const [file, setFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [fileUrl, setFileUrl] = useState<string | null>(null);
  const [generation, setGeneration] = useState<Partial<Generation>>();
  const [loading, setLoading] = useState<boolean>(false);
  const [strengthcopySuccess, setStrengthCopySuccess] = useState<boolean>(false);
  const [feedbackcopySuccess, setFeedbackCopySuccess] = useState<boolean>(false);
  const [selectedFileName, setSelectedFileName] = useState<string>('');
  const [generationData, setGenerationData] = useState<Boolean>();
  const [extractedText, setExtractedText] = useState<string>('');

  const strengthsRef = useRef<HTMLDivElement>(null);
  const feedbacksRef = useRef<HTMLDivElement>(null);

  const copyToClipboard = useCallback((ref: React.RefObject<HTMLDivElement>) => {
    if (ref.current) {
      const text = ref.current.innerText;
      navigator.clipboard.writeText(text);
    } else {
      alert('Failed to copy text');
    }
  }, []);

  const fetchExtractedText = useCallback(async (url: string) => {
    try {
      setLoading(true);
      const response = await fetch(
        'https://pitch-x-backend.vercel.app/extract-text',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ url }),
        }
      );
      if (!response.ok) {
        throw new Error('Failed to extract text from PDF');
      }
      const data = await response.json();
      return data.text;
    } catch (error) {
      console.error('Error fetching extracted text:', error);
      return '';
    } finally {
      setLoading(false);
    }
  }, []);

  const handleAnalysis = useCallback(async () => {
    if (fileUrl && extractedText) {
        setLoading(true);
      const { object } = await generate(extractedText);
      for await (const partialObject of readStreamableValue(object)) {
        if (partialObject) {
            setGeneration(partialObject);
            }
      }
      setGenerationData(true);
      setLoading(false);
    }
  }, [fileUrl, extractedText]);

  useEffect(() => {
    handleAnalysis();
  }, [fileUrl, extractedText, handleAnalysis]);

  const handleFileChange = useCallback((event: ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      setFile(event.target.files[0]);
      setSelectedFileName(event.target.files[0].name);
    }
  }, []);

  const handleCancelSelection = useCallback(() => {
    setFile(null);
    setSelectedFileName('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }, []);

  const handleUploadClick = useCallback(async () => {
    if (file) {
      setLoading(true); // Set loading to true when uploaded
      try {
        // Create FormData object and append the file
        const formData = new FormData();
        formData.append('file', file);

        // Make API call to your backend with the file
        const response = await fetch('https://backend-portfolio-maker-ai.vercel.app/upload', {
          method: 'POST',
          body: formData,
        });

        if (!response.ok) {
          throw new Error('Failed to upload to backend');
        }

        const data = await response.json();
        setFileUrl(data.fileURL); 
        const extractedText = await fetchExtractedText(data.fileURL);
        setExtractedText(extractedText);
      } catch (error) {
        console.error('Error uploading file to backend:', error);
        setLoading(false);
      }
    } else {
      fileInputRef.current?.click();
    }
  }, [file, fetchExtractedText]);

  return (
    <div className="bg-gradient-to-b from-indigo-950 to-black flex flex-col justify-center items-center text-center text-white pt-48">
      <div
        style={{
          backgroundImage: "url('/hero-light.svg')",
          position: 'absolute',
          height: '100%',
          width: '100%',
          top: 0,
          left: 0,
          pointerEvents: 'none',
        }}
      ></div>
      <h1 className="text-6xl font-inter font-bold">Free Resume Review</h1>
      <p className="text-xl text-gray-400 mt-4 mb-8">
        Get detailed feedback on your Resume in seconds!
      </p>
      {loading && !generation ? (
        <div className="flex flex-col justify-center items-center">
          <AiOutlineLoading3Quarters className="animate-spin text-green-500 text-3xl mt-4" />
          <div className="text-lg">Analysing, please wait...</div>
        </div>
      ) : null}
      {generation ? (
        <div className="w-[800px]">
          <div>
            <div className="text-2xl m-2">
              <h2>
                Resume Reviewed:{' '}
                <span className="text-green-500">
                  {file ? selectedFileName : 'No file uploaded'}
                </span>
              </h2>
            </div>
            <div className="w-[480px] mx-auto rounded-xl border border-dashed border-indigo-800 bg-black/80 p-10">
              <div className="text-white">
                <h1 className="text-4xl font-extrabold">
                  Your Score:{' '}
                  <span className="text-green-500">{generation.score}</span>
                </h1>
                <p className="mt-2">
                  <a href="/review" className="text-gray-400 text-lg">
                    Click here to do one more!
                  </a>
                </p>
              </div>
            </div>
            <div>
              <h1 className="text-3xl font-semibold mt-8">
                -: Resume Feedback :-
              </h1>
            </div>

            <div className="w-full p-8">
              <div className="mt-8 rounded-lg p-8 bg-black/[0.3]">
                <div className="flex flow-row justify-between items-center">
                  <h2 className="text-2xl font-semibold">Strengths</h2>
                  <button
                    onClick={() => {
                      copyToClipboard(strengthsRef);
                      setStrengthCopySuccess(true);
                    }}
                    className="bg-black/30 hover:text-blue-600 text-white font-extrabold text-xl p-2 rounded"
                  >
                    {strengthcopySuccess ? <BsClipboard2Check /> : <MdContentCopy />}
                  </button>
                </div>
                <hr className="bg-grey-300 h-0.2 my-1 border-dotted" />
                <div
                  ref={strengthsRef}
                  className="w-full text-white text-justify mt-2 flex flex-col items-center"
                >
                  <ul className="list-decimal pl-5">
                    {generation.strengths?.map((strength, index) => (
                      <li key={index}>{strength}</li>
                    ))}
                  </ul>
                </div>
              </div>
              <div className="rounded-lg mt-8 p-8 bg-black/[0.3]">
                <div className="flex flex-row justify-between items-center">
                  <h1 className="text-2xl font-semibold">Areas for Improvement</h1>
                  <button
                    onClick={() => {
                      copyToClipboard(feedbacksRef);
                      setFeedbackCopySuccess(true);
                    }}
                    className="bg-black/30 hover:text-blue-600 text-white font-extrabold text-xl rounded p-2"
                  >
                    {feedbackcopySuccess ? <BsClipboard2Check /> : <MdContentCopy />}
                  </button>
                </div>
                <hr className="bg-grey-300 h-0.2 my-1 border-dotted" />
                <div
                  ref={feedbacksRef}
                  className="w-full text-white text-justify mt-2 flex flex-col items-center"
                >
                  <ul className="list-decimal pl-5">
                    {generation.feedbacks?.map((feedback, index) => (
                      <li key={index}>{feedback}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>            
          </div>
        </div>
      ):null }
 {!generation && !loading ? (
        <div className="w-full max-w-3xl p-8 bg-black/20 rounded-xl shadow-lg border border-dashed border-gray-400 hover:bg-indigo-800/20 hover:border-indigo-500">
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            className="w-sm p-4 bg-gray-700 text-center text-white border-2 border-gray-500 rounded-lg cursor-pointer hidden"
          />
          {file && (
            <div className="flex items-center justify-center mt-4">
              <span className="mr-2">{selectedFileName}</span>
              <button onClick={handleCancelSelection}>
                <MdClose className="text-red-500 text-2xl" />
              </button>
            </div>
          )}
          <button
            className="w-lg m-3 py-5 px-6 text-lg font-semibold bg-[#6366f1] rounded-xl"
            onClick={handleUploadClick}
          >
            {file ? 'Upload your Resume' : 'Select a Resume to upload'}
          </button>
          <p className="text-gray-500 text-sm">Click to browse, and upload a file here</p>
        </div>
      ) : null}
      <div className="flex justify-around mt-28 w-full max-w-3xl">
        <div className="flex flex-col items-center">
          <IoFlaskSharp className="text-4xl text-[#22d3ee]" />
          <span className="font-semibold">Detailed Feedback</span>
        </div>
        <div className="flex flex-col items-center">
          <FaMoneyBillWave className="text-4xl text-[#f87171]" />
          <span className="font-semibold">Funding Estimate</span>
        </div>
        <div className="flex flex-col items-center">
          <AiFillThunderbolt className="text-4xl text-[#facc15]" />
          <span className="font-semibold">Takes &lt;15 Seconds</span>
        </div>
        <div className="flex flex-col items-center">
          <FaFile className="text-4xl text-[#4ade80]" />
          <span className="font-semibold">Supports PDF</span>
        </div>
        <div className="flex flex-col items-center">
          <HiMiniCheckBadge className="text-4xl text-[#c084fc]" />
          <span className="font-semibold">10k+ Reviews</span>
        </div>
      </div>

      <div className="my-32">
        <h1 className="text-4xl font-semibold">How to get your Resumes reviewed ?</h1>
        <div className="flex justify-between gap-10 mt-12 w-full max-w-5xl">
          <div className="flex flex-col items-center">
            <p className="font-bold my-4 text-2xl">1. Upload your Resume</p>
            <p>Upload your Resume pdf file using the upload field provided.</p>
          </div>
          <div className="flex flex-col items-center">
            <p className="font-bold my-4 text-2xl">2. Get evaluation score</p>
            <p>Get an evaluation score for meeting the major criteria's of evaluation</p>
          </div>
          <div className="flex flex-col items-center">
            <p className="font-bold my-4 text-2xl">3. Get feedback</p>
            <p>Receive detailed feedback on your Resume from our expert system.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResumeReview;
