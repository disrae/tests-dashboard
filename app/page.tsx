'use client';

import { onSnapshot, collection } from 'firebase/firestore';
import { useEffect, useState } from 'react';
import { format } from 'date-fns';
import { db } from '../firebase';
import { CiWarning, CiCircleCheck } from "react-icons/ci";

type Product = {
  test_runner: string;
  branch_name: string;
  status: string;
  account: string;
};

type Brand = {
  [productName: string]: Product;
};

type Test = {
  version: string;
  [brandName: string]: Brand | string;
};
type Tests = Array<Test>;

export default function Home() {
  const [tests, setTests] = useState<Tests>([]);

  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, 'tests'), (snapshot) => {
      const updatedItems = snapshot.docs.map((doc) => {
        return {
          ...doc.data(),
          version: doc.id,
        };
      });
      console.log(JSON.stringify(updatedItems, null, 2));
      setTests(updatedItems);
    });

    return () => unsubscribe();
  }, []);

  return (
    <div className="container mx-auto py-8 px-4 md:p-8 max-w-2xl">
      <h1 className="text-2xl font-bold mb-4">Testing Dashboard</h1>
      {tests.map((test, versionIndex) => (
        <details key={versionIndex} className="border rounded-lg shadow-lg my-8">
          <summary className="font-bold hover:bg-slate-100 p-4">Version {test.version.replaceAll('_', '.')}</summary>
          <div className="ml-4 mt-2">
            {Object.keys(test)
              .filter((key) => key !== 'version')
              .sort((a, b) => b.localeCompare(a))
              .map((brand, brandIndex) => (
                <details key={brandIndex} className="border rounded-lg my-2 bg-slate-50">
                  <summary className="hover:bg-slate-100 p-4">{brand}</summary>
                  <div className="ml-4 mt-2">
                    {Object.keys(test[brand]).sort((a, b) => {
                        const timeA = new Date(test[brand][a].time || '').getTime();
                        const timeB = new Date(test[brand][b].time || '').getTime();
                        return timeB - timeA;
                      }).map((product, productIndex) => {
                      const details = test[brand][product];
                      const time = details.time || '';
                      const formattedTime = time ? format(new Date(time), 'PPpp') : '';
                      const bgColor = details.status === 'Passed' ? 'bg-green-500' : 'bg-';
                      const Icon = details.status === 'in_progress' ? (
                        <CiWarning className="h-6 w-6 text-yellow-500" />
                      ) : (
                        <CiCircleCheck className="h-6 w-6 text-green-500" />
                      );
                      return (
                        <details
                          key={productIndex}
                          className={`my-2 border-l 
                          ${details.status === 'in_progress' ? 'border-orange-400' : 'border-green-500'} \
                          ${bgColor} 
                          rounded-lg`}>
                          <summary className="flex flex-col sm:flex-row justify-between hover:bg-slate-100 p-4 rounded-tl-lg rounded-bl-lg ">
                            <p className='flex flex-wrap justify-between'>
                              {product} 
                            </p>
                            <div className='flex flex-1 sm:flex-none sm:justify-between '>
                            <p className='flex flex-1 sm:flex-none pr-4'>{formattedTime}</p>
                             {Icon}
                             </div>
                          </summary>
                          <div className="pl-4 py-2 bg-slate-100 ">
                            <p><span className='pr-1'>Test Runner:</span> {details.test_runner}</p>
                            <p><span className='pr-1'>Status:</span> {details.status}</p>
                            <p><span className='pr-1'>Branch Name:</span> {details.branch_name}</p>
                            <p><span className='pr-1'>Test Account:</span> {details.account}</p>
                          </div>
                        </details>
                      )
                    })}
                  </div>
                </details>
              ))}
          </div>
        </details>
      ))}
    </div>
  );
}

