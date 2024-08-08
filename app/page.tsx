"use client";

export const dynamic = "force-dynamic";

import React, {
  useState,
  useEffect,
  ChangeEvent,
  useRef,
  useCallback,
  useMemo,
} from "react";
import { IoFlaskSharp } from "react-icons/io5";
import { FaFile } from "react-icons/fa";
import { AiFillThunderbolt, AiOutlineLoading3Quarters } from "react-icons/ai";
import { MdContentCopy, MdClose } from "react-icons/md";
import { BsClipboard2Check } from "react-icons/bs";
import { HiMiniCheckBadge } from "react-icons/hi2";
import { extractInvoiceDetails } from "./actions";
import { toast } from 'react-hot-toast';
import { FaUser, FaBox, FaMoneyBillWave, FaCalendarAlt, FaFileInvoice } from 'react-icons/fa';
import { unstable_noStore as noStore } from "next/cache";
import { readStreamableValue } from "ai/rsc";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

interface CustomerDetails {
  name?: string;
  address?: string;
  phone_number?: string;
  email?: string;
}

interface Product {
  description?: string;
  quantity?: number;
  unit_price?: number;
}

interface TotalAmount {
  subtotal?: number;
  taxes?: number;
  discounts?: number;
  final_total?: number;
}

interface PaymentTerms {
  due_date?: string;
  payment_method?: string;
}

interface InvoiceDetails {
  number?: string;
  issue_date?: string;
}

interface Generation {
  customer_details?: CustomerDetails;
  products?: Product[];
  total_amount?: TotalAmount;
  payment_terms?: PaymentTerms;
  invoice_details?: InvoiceDetails;
}

const ResumeReview: React.FC = () => {
  noStore();
  const [file, setFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [fileUrl, setFileUrl] = useState<string | null>(null);
  const [generation, setGeneration] = useState<Partial<Generation>>();
  const [loading, setLoading] = useState<boolean>(false);
  const [strengthcopySuccess, setStrengthCopySuccess] =
    useState<boolean>(false);
  const [feedbackcopySuccess, setFeedbackCopySuccess] =
    useState<boolean>(false);
  const [selectedFileName, setSelectedFileName] = useState<string>("");
  const [generationData, setGenerationData] = useState<Boolean>();
  const [extractedText, setExtractedText] = useState<string>("");

  const strengthsRef = useRef<HTMLDivElement>(null);
  const feedbacksRef = useRef<HTMLDivElement>(null);

  const copyToClipboard = useCallback(
    (ref: React.RefObject<HTMLDivElement>) => {
      if (ref.current) {
        const text = ref.current.innerText;
        navigator.clipboard.writeText(text);
        toast.success("Copied to clipboard!");
      } else {
        alert("Failed to copy text");
      }
    },
    []
  );


  const fetchExtractedText = useCallback(async (url: string) => {
    try {
      setLoading(true);
      const response = await fetch(
        "https://pitch-x-backend.vercel.app/extract-text",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ url }),
        }
      );
      if (!response.ok) {
        throw new Error("Failed to extract text from PDF");
      }
      const data = await response.json();
      return data.text;
    } catch (error) {
      console.error("Error fetching extracted text:", error);
      return "";
    } finally {
      setLoading(false);
    }
  }, []);

  const handleAnalysis = useCallback(async () => {
    if (fileUrl && extractedText) {
      setLoading(true);
      const { object } = await extractInvoiceDetails(extractedText);
      for await (const partialObject of readStreamableValue(object)) {
        if (partialObject) {
          setGeneration(partialObject);
        }
      }
      console.log("object", generation);
      setGenerationData(true);
      setLoading(false);
    }
  }, [fileUrl, extractedText]);

  useEffect(() => {
    handleAnalysis();
  }, [fileUrl, extractedText, handleAnalysis]);

  const handleFileChange = useCallback(
    (event: ChangeEvent<HTMLInputElement>) => {
      if (event.target.files && event.target.files[0]) {
        setFile(event.target.files[0]);
        setSelectedFileName(event.target.files[0].name);
      }
    },
    []
  );

  const handleCancelSelection = useCallback(() => {
    setFile(null);
    setSelectedFileName("");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }, []);

  const handleUploadClick = useCallback(async () => {
    if (file) {
      setLoading(true);
      try {
        const formData = new FormData();
        formData.append("file", file);

        const response = await fetch(
          "https://backend-portfolio-maker-ai.vercel.app/upload",
          {
            method: "POST",
            body: formData,
          }
        );

        if (!response.ok) {
          throw new Error("Failed to upload to backend");
        }

        const data = await response.json();
        setFileUrl(data.fileURL);
        const extractedText = await fetchExtractedText(data.fileURL);
        setExtractedText(extractedText);
      } catch (error) {
        console.error("Error uploading file to backend:", error);
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
          position: "absolute",
          height: "100%",
          width: "100%",
          top: 0,
          left: 0,
          pointerEvents: "none",
        }}
      ></div>
      <h1 className="text-6xl font-inter font-bold">Invoice Data Extractor</h1>
      <p className="text-xl text-gray-400 mt-4 mb-8">
        Get structured data from your invoice documents
      </p>
      {loading && !generation ? (
        <div className="flex flex-col justify-center items-center">
          <AiOutlineLoading3Quarters className="animate-spin text-green-500 text-3xl mt-4" />
          <div className="text-lg">Analysing, please wait...</div>
        </div>
      ) : null}
      {generation ? (
        <div className="w-[800px] mx-auto">
          <Card className="bg-gradient-to-br from-purple-600 to-indigo-700 text-white shadow-xl rounded-xl overflow-hidden">
      <CardHeader className="bg-black bg-opacity-30 p-6">
        <h2 className="text-3xl font-bold flex items-center justify-between">
          Invoice Details
          <span className="text-xl font-normal bg-yellow-400 text-black px-3 py-1 rounded-full">
            #{generation?.invoice_details?.number || 'N/A'}
          </span>
        </h2>
      </CardHeader>
      <CardContent className="p-6 space-y-8">
        <div className="grid grid-cols-2 gap-6">
          <div className="space-y-2">
            <h3 className="text-xl font-semibold flex items-center">
              <FaUser className="mr-2" /> Customer
            </h3>
            <p className="text-lg bg-white bg-opacity-10 p-2 rounded">
              {generation?.customer_details?.name || 'N/A'}
            </p>
            <p className="text-lg bg-white bg-opacity-10 p-2 rounded">
              {generation?.customer_details?.email || 'N/A'}
            </p>
            <p className="text-lg bg-white bg-opacity-10 p-2 rounded">
              {generation?.customer_details?.phone_number || 'N/A'}
            </p>
            <p className="text-lg bg-white bg-opacity-10 p-2 rounded">
              {generation?.customer_details?.address || 'N/A'}
            </p>
          </div>
          <div className="space-y-2">
            <h3 className="text-xl font-semibold flex items-center">
              <FaCalendarAlt className="mr-2" /> Issue Date
            </h3>
            <p className="text-lg bg-white bg-opacity-10 p-2 rounded">
              {generation?.invoice_details?.issue_date || 'N/A'}
            </p>
          </div>
        </div>

        <div>
          <h3 className="text-xl font-semibold mb-3 flex items-center">
            <FaBox className="mr-2" /> Products
          </h3>
          <ul className="space-y-2">
            {generation?.products?.map((product, index) => (
              <li key={index} className="bg-white bg-opacity-10 p-3 rounded flex justify-between items-center">
                <span>{product.description || 'N/A'}</span>
                <span>
                  Qty: {product.quantity || 'N/A'} x ${product.unit_price || 'N/A'}
                </span>
              </li>
            ))}
          </ul>
        </div>

        <div className="grid grid-cols-2 gap-6">
          <div>
            <h3 className="text-xl font-semibold mb-3 flex items-center">
              <FaMoneyBillWave className="mr-2" /> Total Amount
            </h3>
            <ul className="space-y-2 text-lg">
              <li className="flex justify-between">
                <span>Subtotal:</span>
                <span>${generation?.total_amount?.subtotal || 'N/A'}</span>
              </li>
              <li className="flex justify-between">
                <span>Taxes:</span>
                <span>${generation?.total_amount?.taxes || 'N/A'}</span>
              </li>
              <li className="flex justify-between">
                <span>Discounts:</span>
                <span>${generation?.total_amount?.discounts || 'N/A'}</span>
              </li>
              <li className="flex justify-between font-bold text-xl bg-white bg-opacity-20 p-2 rounded">
                <span>Final Total:</span>
                <span>${generation?.total_amount?.final_total || 'N/A'}</span>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="text-xl font-semibold mb-3 flex items-center">
              <FaFileInvoice className="mr-2" /> Payment Terms
            </h3>
            <ul className="space-y-2 text-lg">
              <li className="flex justify-between">
                <span>Due Date:</span>
                <span>{generation?.payment_terms?.due_date || 'N/A'}</span>
              </li>
              <li className="flex justify-between">
                <span>Payment Method:</span>
                <span>{generation?.payment_terms?.payment_method || 'N/A'}</span>
              </li>
            </ul>
          </div>
        </div>
      </CardContent>
    </Card>
      </div>
      ) : null}
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
            {file ? "Submit your INVOICE" : "Select a Invoice PDF to upload"}
          </button>
          <p className="text-gray-500 text-sm">
            Click to browse, and upload a file here
          </p>
        </div>
      ) : null}
      <div className="flex justify-around mt-28 w-full max-w-3xl">
        <div className="flex flex-col items-center">
          <IoFlaskSharp className="text-4xl text-[#22d3ee]" />
          <span className="font-semibold">Advanced Analysis</span>
        </div>
        <div className="flex flex-col items-center">
          <FaMoneyBillWave className="text-4xl text-[#f87171]" />
          <span className="font-semibold">Real-Time Calculations</span>
        </div>
        <div className="flex flex-col items-center">
          <AiFillThunderbolt className="text-4xl text-[#facc15]" />
          <span className="font-semibold">Fast Processing</span>
        </div>
        <div className="flex flex-col items-center">
          <FaFile className="text-4xl text-[#4ade80]" />
          <span className="font-semibold">PDF Support</span>
        </div>
        <div className="flex flex-col items-center">
          <HiMiniCheckBadge className="text-4xl text-[#c084fc]" />
          <span className="font-semibold">100% Accuracy</span>
        </div>
      </div>

      <div className="my-32">
        <h1 className="text-4xl font-semibold">
          How to Use the Invoice Generator?
        </h1>
        <div className="flex justify-between gap-10 mt-12 w-full max-w-5xl">
          <div className="flex flex-col items-center">
            <p className="font-bold my-4 text-2xl">1. Upload your Invoice</p>
            <p>
              Upload your invoice file in PDF or CSV format using the provided
              upload field. Ensure your document is clear and all the details
              are visible to maximize the accuracy of data extraction.
            </p>
          </div>
          <div className="flex flex-col items-center">
            <p className="font-bold my-4 text-2xl">2. Extract Data</p>
            <p>
              Automatically extract critical information such as customer
              details, products, and total amounts. This process uses advanced
              algorithms to ensure that data is accurately captured from your
              documents.
            </p>
          </div>
          <div className="flex flex-col items-center">
            <p className="font-bold my-4 text-2xl">3. Review and Edit</p>
            <p>
              Review the extracted information for accuracy and make any
              necessary corrections directly within the tool. This step ensures
              that the final output is precise and tailored to your needs.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResumeReview;
