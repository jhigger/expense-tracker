import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
} from "firebase/firestore";
import Head from "next/head";
import { useEffect, useState, type FormEvent } from "react";
import { db } from "../lib/firebase";

type ItemType = { id: string; name: string; price: number };

export default function Home() {
  const [items, setItems] = useState<ItemType[]>([]);
  const empty = {
    id: "",
    name: "",
    price: 0,
  };
  const [newItem, setNewItem] = useState<ItemType>(empty);

  const [total, setTotal] = useState(0);

  // create
  const addItem: (e: FormEvent<HTMLFormElement>) => Promise<void> = async (
    e: FormEvent<HTMLFormElement>,
  ) => {
    e.preventDefault();
    if (newItem.name !== "" && newItem.price > 0) {
      try {
        const docRef = await addDoc(collection(db, "items"), {
          name: newItem.name,
          price: newItem.price,
          timestamp: serverTimestamp(),
        });
        console.log("Document written with ID: ", docRef.id);
      } catch (e) {
        console.error("Error adding document: ", e);
      } finally {
        setNewItem(empty);
      }
    }
  };

  // read
  useEffect(() => {
    const q = query(collection(db, "items"), orderBy("timestamp", "asc"));
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const newItems = querySnapshot.docs.map((doc) => {
        return { ...doc.data(), id: doc.id } as ItemType;
      });
      setItems(newItems);

      const total = newItems.reduce((sum, item) => {
        return sum + item.price;
      }, 0);
      setTotal(total);
    });

    return () => {
      unsubscribe();
    };
  }, []);

  // delete
  const deleteItem = async (id: string) => {
    await deleteDoc(doc(db, "items", id));
  };

  return (
    <>
      <Head>
        <title>Expense tracker</title>
        <meta name="description" content="Generated by create-t3-app" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-black to-[#15162c]">
        <div className="container flex flex-col items-center justify-center gap-12 px-4 py-16 ">
          <h1 className="text-5xl font-extrabold tracking-tight text-white sm:text-[5rem]">
            Expense Tracker
          </h1>
          <div className="flex flex-col gap-4 rounded-xl bg-white/10 p-4 text-white">
            <form
              className="grid grid-cols-6 gap-4 text-black"
              onSubmit={(e) => void addItem(e)}
            >
              <input
                className="col-span-3 rounded border p-3"
                type="text"
                name="item"
                id="item"
                placeholder="Enter item"
                value={newItem.name}
                onChange={(e) => {
                  setNewItem({ ...newItem, name: e.target.value });
                }}
              />
              <input
                className="col-span-2 rounded border p-3"
                type="number"
                name="price"
                id="price"
                placeholder="Enter price"
                value={newItem.price}
                onChange={(e) => {
                  setNewItem({ ...newItem, price: Number(e.target.value) });
                }}
              />
              <button
                className="bg-slate-950 p-3 text-white hover:bg-slate-900"
                type="submit"
              >
                +
              </button>
            </form>
            {items.length > 0 && (
              <>
                <ul>
                  {items.map((item) => {
                    return (
                      <li
                        key={item.id}
                        className="border-b-2 border-white/10 bg-slate-950 last:border-b-0"
                      >
                        <div className="grid grid-cols-6 gap-4">
                          <span className="col-span-3 p-3 capitalize">
                            {item.name}
                          </span>
                          <span className="col-span-2 p-3 text-center">
                            {item.price}
                          </span>
                          <button
                            onClick={() => void deleteItem(item.id)}
                            className="border-l-2 border-white/10 bg-slate-950 p-3 text-white hover:bg-slate-900"
                          >
                            -
                          </button>
                        </div>
                      </li>
                    );
                  })}
                </ul>
                <div className="flex justify-between p-3">
                  <span>Total:</span>
                  <span className="mx-2 mb-1 w-full border-b-2 border-dotted"></span>
                  <span>{total}</span>
                </div>
              </>
            )}
          </div>
        </div>
      </main>
    </>
  );
}
