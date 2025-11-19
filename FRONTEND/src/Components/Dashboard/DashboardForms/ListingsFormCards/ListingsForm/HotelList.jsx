// import React, { useEffect, useState } from "react";
// import { useNavigate } from "react-router-dom";

// const ManageHotels = () => {
//   const [hotels, setHotels] = useState([]);
//   const [showAddModal, setShowAddModal] = useState(false);
//   const [showEditModal, setShowEditModal] = useState(false);

//   const [newHotel, setNewHotel] = useState({ hotelName: "", price: "" });

//   const [editHotel, setEditHotel] = useState({
//     _id: "",
//     hotelName: "",
//     price: "",
//   });

//   const navigate = useNavigate();

//   // ---------------- FETCH HOTELS ----------------
//   const fetchHotels = async () => {
//     try {
//       const res = await fetch("http://localhost:5000/api/hotel");
//       const data = await res.json();

//       if (data.success && Array.isArray(data.data)) {
//         setHotels(data.data);
//       } else {
//         setHotels([]);
//       }
//     } catch (err) {
//       console.error("Error fetching hotels:", err);
//       setHotels([]);
//     }
//   };

//   // ---------------- ADD NEW HOTEL ----------------
//   const saveHotel = async () => {
//     if (!newHotel.hotelName || !newHotel.price) {
//       alert("Please fill all fields");
//       return;
//     }

//     try {
//       const res = await fetch("http://localhost:5000/api/hotel", {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify(newHotel),
//       });

//       const data = await res.json();

//       if (data.success) {
//         alert("Hotel added successfully!");
//         setShowAddModal(false);
//         setNewHotel({ hotelName: "", price: "" });
//         fetchHotels();
//       } else {
//         alert("Error adding hotel");
//       }
//     } catch (err) {
//       console.error("Error adding hotel:", err);
//     }
//   };

//   // ---------------- DELETE HOTEL ----------------
//   const deleteHotel = async (id) => {
//     if (!window.confirm("Are you sure you want to delete this hotel?")) return;

//     try {
//       await fetch(`http://localhost:5000/api/hotel/${id}`, {
//         method: "DELETE",
//       });
//       fetchHotels();
//     } catch (err) {
//       console.error("Error deleting hotel", err);
//     }
//   };

//   // ---------------- OPEN EDIT MODAL ----------------
//   const openEditModal = (hotel) => {
//     setEditHotel({
//       _id: hotel._id,
//       hotelName: hotel.hotelName,
//       price: hotel.price,
//     });
//     setShowEditModal(true);
//   };

//   // ---------------- UPDATE HOTEL ----------------
//   const updateHotel = async () => {
//     try {
//       const res = await fetch(
//         `http://localhost:5000/api/hotel/${editHotel._id}`,
//         {
//           method: "PUT",
//           headers: { "Content-Type": "application/json" },
//           body: JSON.stringify({
//             hotelName: editHotel.hotelName,
//             price: editHotel.price,
//           }),
//         }
//       );

//       const data = await res.json();

//       if (data.success) {
//         alert("Hotel updated successfully!");
//         setShowEditModal(false);
//         fetchHotels();
//       } else {
//         alert(data.message || "Error updating hotel");
//       }
//     } catch (err) {
//       console.error("Error updating hotel:", err);
//     }
//   };

//   useEffect(() => {
//     fetchHotels();
//   }, []);

//   return (
//     <div style={styles.container}>
//       <h1 style={styles.heading}>Manage Hotels</h1>

//       <button style={styles.backBtn} onClick={() => navigate(-1)}>
//         ⬅ Back
//       </button>

//       <button style={styles.addBtn} onClick={() => setShowAddModal(true)}>
//         ➕ Add New Hotel
//       </button>

//       {/* ---------------- TABLE ---------------- */}
//       <table style={styles.table}>
//         <thead>
//           <tr>
//             <th style={styles.th}>Hotel Name</th>
//             <th style={styles.th}>Price</th>
//             <th style={styles.th}>Actions</th>
//           </tr>
//         </thead>

//         <tbody>
//           {hotels.length > 0 ? (
//             hotels.map((hotel) => (
//               <tr key={hotel._id}>
//                 <td style={styles.td}>{hotel.hotelName}</td>
//                 <td style={styles.td}>${hotel.price}</td>

//                 <td style={styles.actionTd}>
//                   <button
//                     style={styles.deleteBtn}
//                     onClick={() => deleteHotel(hotel._id)}
//                   >
//                     Delete
//                   </button>

//                   <button
//                     style={styles.editBtn}
//                     onClick={() => openEditModal(hotel)}
//                   >
//                     Edit
//                   </button>

//                   <button
//                     style={styles.viewBtn}
//                     onClick={() => navigate(`/view-hotel/${hotel._id}`)}
//                   >
//                     View
//                   </button>
//                 </td>
//               </tr>
//             ))
//           ) : (
//             <tr>
//               <td colSpan="3" style={styles.noData}>
//                 No hotels found.
//               </td>
//             </tr>
//           )}
//         </tbody>
//       </table>

//       {/* ---------------- ADD HOTEL MODAL ---------------- */}
//       {showAddModal && (
//         <div style={styles.modalOverlay}>
//           <div style={styles.modalBox}>
//             <h2>Add Hotel</h2>

//             <input
//               type="text"
//               placeholder="Hotel Name"
//               value={newHotel.hotelName}
//               onChange={(e) =>
//                 setNewHotel({ ...newHotel, hotelName: e.target.value })
//               }
//               style={styles.input}
//             />

//             <input
//               type="number"
//               placeholder="Price"
//               value={newHotel.price}
//               onChange={(e) =>
//                 setNewHotel({ ...newHotel, price: e.target.value })
//               }
//               style={styles.input}
//             />

//             <div style={styles.modalBtns}>
//               <button style={styles.saveBtn} onClick={saveHotel}>
//                 Save
//               </button>
//               <button
//                 style={styles.cancelBtn}
//                 onClick={() => setShowAddModal(false)}
//               >
//                 Cancel
//               </button>
//             </div>
//           </div>
//         </div>
//       )}

//       {/* ---------------- EDIT HOTEL MODAL ---------------- */}
//       {showEditModal && (
//         <div style={styles.modalOverlay}>
//           <div style={styles.modalBox}>
//             <h2>Edit Hotel</h2>

//             <input
//               type="text"
//               placeholder="Hotel Name"
//               value={editHotel.hotelName}
//               onChange={(e) =>
//                 setEditHotel({ ...editHotel, hotelName: e.target.value })
//               }
//               style={styles.input}
//             />

//             <input
//               type="number"
//               placeholder="Price"
//               value={editHotel.price}
//               onChange={(e) =>
//                 setEditHotel({ ...editHotel, price: e.target.value })
//               }
//               style={styles.input}
//             />

//             <div style={styles.modalBtns}>
//               <button style={styles.saveBtn} onClick={updateHotel}>
//                 Update
//               </button>
//               <button
//                 style={styles.cancelBtn}
//                 onClick={() => setShowEditModal(false)}
//               >
//                 Cancel
//               </button>
//             </div>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// };

// export default ManageHotels;

// //
// // ---------- STYLES ----------
// //
// const styles = {
//   container: {
//     width: "90%",
//     margin: "40px auto",
//     fontFamily: "Arial, sans-serif",
//   },
//   heading: {
//     fontSize: "28px",
//     fontWeight: "bold",
//     marginBottom: "20px",
//   },
//   addBtn: {
//     padding: "10px 18px",
//     background: "black",
//     color: "white",
//     borderRadius: "5px",
//     cursor: "pointer",
//     float: "right",
//     marginBottom: "10px",
//   },
//   backBtn: {
//     padding: "8px 15px",
//     background: "#777",
//     color: "white",
//     borderRadius: "5px",
//     cursor: "pointer",
//     marginBottom: "10px",
//   },
//   table: {
//     width: "100%",
//     borderCollapse: "collapse",
//     background: "white",
//     marginTop: "20px",
//   },
//   th: {
//     background: "#f4f4f4",
//     padding: "12px",
//     textAlign: "left",
//     fontWeight: "bold",
//     borderBottom: "2px solid #ddd",
//   },
//   td: {
//     padding: "12px",
//     borderBottom: "1px solid #eee",
//   },
//   actionTd: {
//     padding: "12px",
//     borderBottom: "1px solid #eee",
//     display: "flex",
//     gap: "10px",
//   },
//   deleteBtn: {
//     color: "red",
//     cursor: "pointer",
//     background: "none",
//     border: "none",
//     fontWeight: "bold",
//   },
//   editBtn: {
//     color: "purple",
//     cursor: "pointer",
//     background: "none",
//     border: "none",
//     fontWeight: "bold",
//   },
//   viewBtn: {
//     color: "green",
//     cursor: "pointer",
//     background: "none",
//     border: "none",
//     fontWeight: "bold",
//   },
//   noData: {
//     textAlign: "center",
//     padding: "20px",
//     color: "#888",
//   },
//   modalOverlay: {
//     position: "fixed",
//     top: 0,
//     left: 0,
//     width: "100%",
//     height: "100%",
//     background: "rgba(0,0,0,0.5)",
//     display: "flex",
//     alignItems: "center",
//     justifyContent: "center",
//   },
//   modalBox: {
//     width: "350px",
//     padding: "20px",
//     background: "white",
//     borderRadius: "8px",
//     boxShadow: "0 4px 10px rgba(0,0,0,0.3)",
//   },
//   input: {
//     width: "100%",
//     padding: "10px",
//     marginBottom: "10px",
//     border: "1px solid #ccc",
//     borderRadius: "4px",
//   },
//   modalBtns: {
//     display: "flex",
//     justifyContent: "space-between",
//     marginTop: "10px",
//   },
//   saveBtn: {
//     padding: "10px 15px",
//     background: "green",
//     color: "white",
//     border: "none",
//     borderRadius: "5px",
//     cursor: "pointer",
//   },
//   cancelBtn: {
//     padding: "10px 15px",
//     background: "#999",
//     color: "white",
//     border: "none",
//     borderRadius: "5px",
//     cursor: "pointer",
//   },
// };
import React from "react";
import { ArrowLeft, Plus, Pencil, Trash2 } from "lucide-react";
import { useNavigate } from "react-router-dom";

const HotelList = () => {
  const navigate = useNavigate();

  const handleBack = () => {
    navigate("/dashboard/listings");
  };

  const hotels = [
    { id: 1, name: "Al Haram Hotel", price: "250 SR" },
    { id: 2, name: "Nawazi Ajyad Hotel", price: "180 SR" },
  ];

  // ROLE CHECK
  const type = localStorage.getItem("type");
  const isAdmin = type === "admin";

  return (
    <div className="px-4 sm:px-8 py-6 w-full ">
      {/* BACK BUTTON */}
      <button
        onClick={handleBack}
        className="flex items-center cursor-pointer gap-2 text-gray-700 hover:text-black mb-6"
      >
        <ArrowLeft size={20} />
        <span className="font-medium">Back</span>
      </button>

      {/* HEADER */}
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-extrabold text-gray-900">Hotels List</h1>

        {/* SHOW ADD BUTTON ONLY FOR ADMIN */}
        {isAdmin && (
          <button
            className="flex cursor-pointer items-center gap-2 bg-blue-600 text-white px-4 py-2 
            rounded-lg shadow hover:bg-blue-700 transition"
          >
            <Plus size={20} />
            Add
          </button>
        )}
      </div>

      {/* TABLE */}
      <div className="bg-white shadow-md rounded-xl overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-gray-100 text-gray-700">
            <tr>
              <th className="py-3 px-4 text-sm font-semibold">Hotel Name</th>
              <th className="py-3 px-4 text-sm font-semibold">Price</th>
              {/* Only show Actions column for Admin */}
              {isAdmin && (
                <th className="py-3 px-4 text-sm font-semibold">Actions</th>
              )}
            </tr>
          </thead>

          <tbody>
            {hotels.map((hotel) => (
              <tr
                key={hotel.id}
                className="border-b hover:bg-gray-50 transition"
              >
                <td className="py-3 px-4">{hotel.name}</td>
                <td className="py-3 px-4">{hotel.price}</td>

                {/* ACTION ICONS ONLY FOR ADMIN */}
                {isAdmin && (
                  <td className="py-3 px-4 flex items-center gap-4">
                    <button className="text-blue-600 cursor-pointer hover:text-blue-800">
                      <Pencil size={20} />
                    </button>

                    <button className="text-red-600 cursor-pointer hover:text-red-800">
                      <Trash2 size={20} />
                    </button>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default HotelList;
