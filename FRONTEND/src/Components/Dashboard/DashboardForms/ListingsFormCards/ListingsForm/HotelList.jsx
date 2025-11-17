import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const ManageHotels = () => {
  const [hotels, setHotels] = useState([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);

  const [newHotel, setNewHotel] = useState({ hotelName: "", price: "" });

  const [editHotel, setEditHotel] = useState({
    _id: "",
    hotelName: "",
    price: "",
  });

  const navigate = useNavigate();

  // ---------------- FETCH HOTELS ----------------
  const fetchHotels = async () => {
    try {
      const res = await fetch("http://localhost:5000/api/hotel");
      const data = await res.json();

      if (data.success && Array.isArray(data.data)) {
        setHotels(data.data);
      } else {
        setHotels([]);
      }
    } catch (err) {
      console.error("Error fetching hotels:", err);
      setHotels([]);
    }
  };

  // ---------------- ADD NEW HOTEL ----------------
  const saveHotel = async () => {
    if (!newHotel.hotelName || !newHotel.price) {
      alert("Please fill all fields");
      return;
    }

    try {
      const res = await fetch("http://localhost:5000/api/hotel", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newHotel),
      });

      const data = await res.json();

      if (data.success) {
        alert("Hotel added successfully!");
        setShowAddModal(false);
        setNewHotel({ hotelName: "", price: "" });
        fetchHotels();
      } else {
        alert("Error adding hotel");
      }
    } catch (err) {
      console.error("Error adding hotel:", err);
    }
  };

  // ---------------- DELETE HOTEL ----------------
  const deleteHotel = async (id) => {
    if (!window.confirm("Are you sure you want to delete this hotel?")) return;

    try {
      await fetch(`http://localhost:5000/api/hotel/${id}`, {
        method: "DELETE",
      });
      fetchHotels();
    } catch (err) {
      console.error("Error deleting hotel", err);
    }
  };

  // ---------------- OPEN EDIT MODAL ----------------
  const openEditModal = (hotel) => {
    setEditHotel({
      _id: hotel._id,
      hotelName: hotel.hotelName,
      price: hotel.price,
    });
    setShowEditModal(true);
  };

  // ---------------- UPDATE HOTEL ----------------
  const updateHotel = async () => {
    try {
      const res = await fetch(
        `http://localhost:5000/api/hotel/${editHotel._id}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            hotelName: editHotel.hotelName,
            price: editHotel.price,
          }),
        }
      );

      const data = await res.json();

      if (data.success) {
        alert("Hotel updated successfully!");
        setShowEditModal(false);
        fetchHotels();
      } else {
        alert(data.message || "Error updating hotel");
      }
    } catch (err) {
      console.error("Error updating hotel:", err);
    }
  };

  useEffect(() => {
    fetchHotels();
  }, []);

  return (
    <div style={styles.container}>
      <h1 style={styles.heading}>Manage Hotels</h1>

      <button style={styles.backBtn} onClick={() => navigate(-1)}>
        ⬅ Back
      </button>

      <button style={styles.addBtn} onClick={() => setShowAddModal(true)}>
        ➕ Add New Hotel
      </button>

      {/* ---------------- TABLE ---------------- */}
      <table style={styles.table}>
        <thead>
          <tr>
            <th style={styles.th}>Hotel Name</th>
            <th style={styles.th}>Price</th>
            <th style={styles.th}>Actions</th>
          </tr>
        </thead>

        <tbody>
          {hotels.length > 0 ? (
            hotels.map((hotel) => (
              <tr key={hotel._id}>
                <td style={styles.td}>{hotel.hotelName}</td>
                <td style={styles.td}>${hotel.price}</td>

                <td style={styles.actionTd}>
                  <button
                    style={styles.deleteBtn}
                    onClick={() => deleteHotel(hotel._id)}
                  >
                    Delete
                  </button>

                  <button
                    style={styles.editBtn}
                    onClick={() => openEditModal(hotel)}
                  >
                    Edit
                  </button>

                  <button
                    style={styles.viewBtn}
                    onClick={() => navigate(`/view-hotel/${hotel._id}`)}
                  >
                    View
                  </button>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="3" style={styles.noData}>
                No hotels found.
              </td>
            </tr>
          )}
        </tbody>
      </table>

      {/* ---------------- ADD HOTEL MODAL ---------------- */}
      {showAddModal && (
        <div style={styles.modalOverlay}>
          <div style={styles.modalBox}>
            <h2>Add Hotel</h2>

            <input
              type="text"
              placeholder="Hotel Name"
              value={newHotel.hotelName}
              onChange={(e) =>
                setNewHotel({ ...newHotel, hotelName: e.target.value })
              }
              style={styles.input}
            />

            <input
              type="number"
              placeholder="Price"
              value={newHotel.price}
              onChange={(e) =>
                setNewHotel({ ...newHotel, price: e.target.value })
              }
              style={styles.input}
            />

            <div style={styles.modalBtns}>
              <button style={styles.saveBtn} onClick={saveHotel}>
                Save
              </button>
              <button
                style={styles.cancelBtn}
                onClick={() => setShowAddModal(false)}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ---------------- EDIT HOTEL MODAL ---------------- */}
      {showEditModal && (
        <div style={styles.modalOverlay}>
          <div style={styles.modalBox}>
            <h2>Edit Hotel</h2>

            <input
              type="text"
              placeholder="Hotel Name"
              value={editHotel.hotelName}
              onChange={(e) =>
                setEditHotel({ ...editHotel, hotelName: e.target.value })
              }
              style={styles.input}
            />

            <input
              type="number"
              placeholder="Price"
              value={editHotel.price}
              onChange={(e) =>
                setEditHotel({ ...editHotel, price: e.target.value })
              }
              style={styles.input}
            />

            <div style={styles.modalBtns}>
              <button style={styles.saveBtn} onClick={updateHotel}>
                Update
              </button>
              <button
                style={styles.cancelBtn}
                onClick={() => setShowEditModal(false)}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageHotels;

//
// ---------- STYLES ----------
//
const styles = {
  container: {
    width: "90%",
    margin: "40px auto",
    fontFamily: "Arial, sans-serif",
  },
  heading: {
    fontSize: "28px",
    fontWeight: "bold",
    marginBottom: "20px",
  },
  addBtn: {
    padding: "10px 18px",
    background: "black",
    color: "white",
    borderRadius: "5px",
    cursor: "pointer",
    float: "right",
    marginBottom: "10px",
  },
  backBtn: {
    padding: "8px 15px",
    background: "#777",
    color: "white",
    borderRadius: "5px",
    cursor: "pointer",
    marginBottom: "10px",
  },
  table: {
    width: "100%",
    borderCollapse: "collapse",
    background: "white",
    marginTop: "20px",
  },
  th: {
    background: "#f4f4f4",
    padding: "12px",
    textAlign: "left",
    fontWeight: "bold",
    borderBottom: "2px solid #ddd",
  },
  td: {
    padding: "12px",
    borderBottom: "1px solid #eee",
  },
  actionTd: {
    padding: "12px",
    borderBottom: "1px solid #eee",
    display: "flex",
    gap: "10px",
  },
  deleteBtn: {
    color: "red",
    cursor: "pointer",
    background: "none",
    border: "none",
    fontWeight: "bold",
  },
  editBtn: {
    color: "purple",
    cursor: "pointer",
    background: "none",
    border: "none",
    fontWeight: "bold",
  },
  viewBtn: {
    color: "green",
    cursor: "pointer",
    background: "none",
    border: "none",
    fontWeight: "bold",
  },
  noData: {
    textAlign: "center",
    padding: "20px",
    color: "#888",
  },
  modalOverlay: {
    position: "fixed",
    top: 0,
    left: 0,
    width: "100%",
    height: "100%",
    background: "rgba(0,0,0,0.5)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  modalBox: {
    width: "350px",
    padding: "20px",
    background: "white",
    borderRadius: "8px",
    boxShadow: "0 4px 10px rgba(0,0,0,0.3)",
  },
  input: {
    width: "100%",
    padding: "10px",
    marginBottom: "10px",
    border: "1px solid #ccc",
    borderRadius: "4px",
  },
  modalBtns: {
    display: "flex",
    justifyContent: "space-between",
    marginTop: "10px",
  },
  saveBtn: {
    padding: "10px 15px",
    background: "green",
    color: "white",
    border: "none",
    borderRadius: "5px",
    cursor: "pointer",
  },
  cancelBtn: {
    padding: "10px 15px",
    background: "#999",
    color: "white",
    border: "none",
    borderRadius: "5px",
    cursor: "pointer",
  },
};
