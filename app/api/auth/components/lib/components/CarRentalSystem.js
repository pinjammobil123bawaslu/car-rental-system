# 📄 File: components/CarRentalSystem.js

Copy seluruh kode di bawah ini untuk file `components/CarRentalSystem.js`:

```javascript
'use client';

import React, { useState, useEffect } from 'react';
import { Car, LogIn, LogOut, Plus, Edit2, Trash2, Clock, Calendar, FileText, Printer } from 'lucide-react';

export default function CarRentalSystem() {
  const [isAdmin, setIsAdmin] = useState(false);
  const [adminPassword, setAdminPassword] = useState('');
  const [showLogin, setShowLogin] = useState(false);
  
  const [cars, setCars] = useState([]);
  const [rentals, setRentals] = useState([]);
  
  const [showCarForm, setShowCarForm] = useState(false);
  const [showRentalForm, setShowRentalForm] = useState(false);
  const [showReturnForm, setShowReturnForm] = useState(false);
  const [showReport, setShowReport] = useState(false);
  
  const [editingCar, setEditingCar] = useState(null);
  const [selectedCar, setSelectedCar] = useState(null);
  const [returningRental, setReturningRental] = useState(null);
  
  const [carForm, setCarForm] = useState({ type: '', plate: '' });
  const [rentalForm, setRentalForm] = useState({ borrowerName: '', purpose: '' });
  const [returnForm, setReturnForm] = useState({ condition: '' });
  
  const [filterName, setFilterName] = useState('');
  const [filterCar, setFilterCar] = useState('');
  const [filterDateFrom, setFilterDateFrom] = useState('');
  const [filterDateTo, setFilterDateTo] = useState('');

  useEffect(() => {
    fetchCars();
    fetchRentals();
  }, []);

  const fetchCars = async () => {
    const res = await fetch('/api/cars');
    const data = await res.json();
    setCars(data);
  };

  const fetchRentals = async () => {
    const res = await fetch('/api/rentals');
    const data = await res.json();
    setRentals(data);
  };

  const handleLogin = async () => {
    const res = await fetch('/api/auth', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password: adminPassword })
    });
    
    const data = await res.json();
    if (data.success) {
      setIsAdmin(true);
      setShowLogin(false);
      setAdminPassword('');
    } else {
      alert('Password salah!');
    }
  };

  const handleLogout = () => {
    setIsAdmin(false);
  };

  const handleAddCar = async () => {
    if (!carForm.type || !carForm.plate) {
      alert('Harap isi semua data mobil');
      return;
    }
    
    if (editingCar) {
      await fetch('/api/cars', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          id: editingCar.id, 
          type: carForm.type, 
          plate: carForm.plate,
          status: editingCar.status 
        })
      });
      setEditingCar(null);
    } else {
      await fetch('/api/cars', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(carForm)
      });
    }
    
    setCarForm({ type: '', plate: '' });
    setShowCarForm(false);
    fetchCars();
  };

  const handleEditCar = (car) => {
    setEditingCar(car);
    setCarForm({ type: car.type, plate: car.plate });
    setShowCarForm(true);
  };

  const handleDeleteCar = async (carId) => {
    if (confirm('Yakin ingin menghapus mobil ini?')) {
      await fetch(`/api/cars?id=${carId}`, { method: 'DELETE' });
      fetchCars();
    }
  };

  const handleRentCar = async () => {
    if (!rentalForm.borrowerName || !rentalForm.purpose) {
      alert('Harap isi nama dan tujuan peminjaman');
      return;
    }

    const now = new Date();
    await fetch('/api/rentals', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        carId: selectedCar.id,
        carType: selectedCar.type,
        carPlate: selectedCar.plate,
        borrowerName: rentalForm.borrowerName,
        purpose: rentalForm.purpose,
        rentDate: now.toLocaleDateString('id-ID'),
        rentTime: now.toLocaleTimeString('id-ID')
      })
    });

    setRentalForm({ borrowerName: '', purpose: '' });
    setSelectedCar(null);
    setShowRentalForm(false);
    fetchCars();
    fetchRentals();
  };

  const handleReturnCar = async () => {
    if (!returnForm.condition) {
      alert('Harap isi kondisi mobil');
      return;
    }

    const now = new Date();
    await fetch('/api/rentals', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        id: returningRental.id,
        returnDate: now.toLocaleDateString('id-ID'),
        returnTime: now.toLocaleTimeString('id-ID'),
        condition: returnForm.condition
      })
    });

    setReturnForm({ condition: '' });
    setReturningRental(null);
    setShowReturnForm(false);
    fetchCars();
    fetchRentals();
  };

  const getFilteredRentals = () => {
    return rentals.filter(rental => {
      const matchName = !filterName || rental.borrower_name.toLowerCase().includes(filterName.toLowerCase());
      const matchCar = !filterCar || rental.car_type.toLowerCase().includes(filterCar.toLowerCase());
      
      let matchDate = true;
      if (filterDateFrom || filterDateTo) {
        const rentalDate = new Date(rental.rent_date.split('/').reverse().join('-'));
        if (filterDateFrom) {
          matchDate = matchDate && rentalDate >= new Date(filterDateFrom);
        }
        if (filterDateTo) {
          matchDate = matchDate && rentalDate <= new Date(filterDateTo);
        }
      }
      
      return matchName && matchCar && matchDate;
    });
  };

  const handlePrint = () => {
    const printWindow = window.open('', '', 'height=600,width=800');
    const filteredRentals = getFilteredRentals();
    
    printWindow.document.write(`
      <html>
        <head>
          <title>Laporan Peminjaman Mobil</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 20px; }
            h1 { text-align: center; margin-bottom: 30px; }
            table { width: 100%; border-collapse: collapse; margin-bottom: 50px; }
            th, td { border: 1px solid #000; padding: 8px; text-align: left; }
            th { background-color: #f0f0f0; }
            .signature { margin-top: 50px; }
            .signature-row { display: flex; justify-content: space-around; margin-top: 80px; }
            .signature-box { text-align: center; }
            .signature-line { border-top: 1px solid #000; width: 200px; margin: 0 auto; padding-top: 5px; }
          </style>
        </head>
        <body>
          <h1>LAPORAN PEMINJAMAN MOBIL INVENTARIS KANTOR</h1>
          <table>
            <thead>
              <tr>
                <th>No</th>
                <th>Nama Peminjam</th>
                <th>Mobil & Plat</th>
                <th>Tanggal & Jam Pinjam</th>
                <th>Tanggal & Jam Kembali</th>
                <th>Tujuan</th>
                <th>Kondisi</th>
              </tr>
            </thead>
            <tbody>
              ${filteredRentals.map((rental, idx) => `
                <tr>
                  <td>${idx + 1}</td>
                  <td>${rental.borrower_name}</td>
                  <td>${rental.car_type}<br>${rental.car_plate}</td>
                  <td>${rental.rent_date}<br>${rental.rent_time}</td>
                  <td>${rental.return_date || '-'}<br>${rental.return_time || '-'}</td>
                  <td>${rental.purpose}</td>
                  <td>${rental.condition || '-'}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
          <div class="signature">
            <div class="signature-row">
              <div class="signature-box">
                <p>Peminjam</p>
                <div class="signature-line">(...........................)</div>
              </div>
              <div class="signature-box">
                <p>Admin</p>
                <div class="signature-line">(...........................)</div>
              </div>
            </div>
          </div>
        </body>
      </html>
    `);
    
    printWindow.document.close();
    printWindow.print();
  };

  const activeRentals = rentals.filter(r => r.status === 'Dipinjam');

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-blue-600 text-white p-4 shadow-lg">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Car size={32} />
            <h1 className="text-2xl font-bold">Sistem Peminjaman Mobil Kantor</h1>
          </div>
          <div>
            {isAdmin ? (
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 bg-red-500 px-4 py-2 rounded hover:bg-red-600"
              >
                <LogOut size={20} />
                Logout Admin
              </button>
            ) : (
              <button
                onClick={() => setShowLogin(true)}
                className="flex items-center gap-2 bg-green-500 px-4 py-2 rounded hover:bg-green-600"
              >
                <LogIn size={20} />
                Login Admin
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto p-6">
        {showLogin && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-96">
              <h2 className="text-xl font-bold mb-4">Login Admin</h2>
              <input
                type="password"
                placeholder="Password"
                value={adminPassword}
                onChange={(e) => setAdminPassword(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleLogin()}
                className="w-full border p-2 rounded mb-4"
              />
              <div className="flex gap-2">
                <button
                  onClick={handleLogin}
                  className="flex-1 bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
                >
                  Login
                </button>
                <button
                  onClick={() => {
                    setShowLogin(false);
                    setAdminPassword('');
                  }}
                  className="flex-1 bg-gray-300 py-2 rounded hover:bg-gray-400"
                >
                  Batal
                </button>
              </div>
              <p className="text-sm text-gray-500 mt-4">Default password: admin123</p>
            </div>
          </div>
        )}

        {isAdmin && (
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">Panel Admin</h2>
              <div className="flex gap-2">
                <button
                  onClick={() => setShowCarForm(true)}
                  className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
                >
                  <Plus size={20} />
                  Tambah Mobil
                </button>
                <button
                  onClick={() => setShowReport(true)}
                  className="flex items-center gap-2 bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700"
                >
                  <FileText size={20} />
                  Laporan
                </button>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="p-3 text-left">ID</th>
                    <th className="p-3 text-left">Jenis Mobil</th>
                    <th className="p-3 text-left">Plat Nomor</th>
                    <th className="p-3 text-left">Status</th>
                    <th className="p-3 text-left">Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {cars.map(car => (
                    <tr key={car.id} className="border-b">
                      <td className="p-3">{car.id}</td>
                      <td className="p-3">{car.type}</td>
                      <td className="p-3">{car.plate}</td>
                      <td className="p-3">
                        <span className={`px-2 py-1 rounded text-sm ${
                          car.status === 'Tersedia' 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {car.status}
                        </span>
                      </td>
                      <td className="p-3">
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleEditCar(car)}
                            className="text-blue-600 hover:text-blue-800"
                          >
                            <Edit2 size={18} />
                          </button>
                          <button
                            onClick={() => handleDeleteCar(car.id)}
                            className="text-red-600 hover:text-red-800"
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {showCarForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-96">
              <h2 className="text-xl font-bold mb-4">
                {editingCar ? 'Edit Mobil' : 'Tambah Mobil'}
              </h2>
              <input
                type="text"
                placeholder="Jenis Mobil"
                value={carForm.type}
                onChange={(e) => setCarForm({ ...carForm, type: e.target.value })}
                className="w-full border p-2 rounded mb-3"
              />
              <input
                type="text"
                placeholder="Plat Nomor"
                value={carForm.plate}
                onChange={(e) => setCarForm({ ...carForm, plate: e.target.value })}
                className="w-full border p-2 rounded mb-4"
              />
              <div className="flex gap-2">
                <button
                  onClick={handleAddCar}
                  className="flex-1 bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
                >
                  Simpan
                </button>
                <button
                  onClick={() => {
                    setShowCarForm(false);
                    setEditingCar(null);
                    setCarForm({ type: '', plate: '' });
                  }}
                  className="flex-1 bg-gray-300 py-2 rounded hover:bg-gray-400"
                >
                  Batal
                </button>
              </div>
            </div>
          </div>
        )}

        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-bold mb-4">Mobil Tersedia</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {cars.filter(car => car.status === 'Tersedia').map(car => (
              <div key={car.id} className="border rounded-lg p-4 hover:shadow-lg transition">
                <div className="flex items-center gap-2 mb-2">
                  <Car className="text-blue-600" size={24} />
                  <h3 className="font-bold">{car.type}</h3>
                </div>
                <p className="text-gray-600 mb-3">{car.plate}</p>
                <button
                  onClick={() => {
                    setSelectedCar(car);
                    setShowRentalForm(true);
                  }}
                  className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
                >
                  Pinjam Mobil
                </button>
              </div>
            ))}
          </div>
          {cars.filter(car => car.status === 'Tersedia').length === 0 && (
            <p className="text-center text-gray-500">Tidak ada mobil tersedia</p>
          )}
        </div>

        {showRentalForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-96">
              <h2 className="text-xl font-bold mb-4">Form Peminjaman</h2>
              <div className="mb-3">
                <p className="text-sm text-gray-600">Mobil: {selectedCar.type}</p>
                <p className="text-sm text-gray-600">Plat: {selectedCar.plate}</p>
              </div>
              <input
                type="text"
                placeholder="Nama Peminjam"
                value={rentalForm.borrowerName}
                onChange={(e) => setRentalForm({ ...rentalForm, borrowerName: e.target.value })}
                className="w-full border p-2 rounded mb-3"
              />
              <textarea
                placeholder="Tujuan Peminjaman"
                value={rentalForm.purpose}
                onChange={(e) => setRentalForm({ ...rentalForm, purpose: e.target.value })}
                className="w-full border p-2 rounded mb-4 h-24"
              />
              <div className="flex gap-2">
                <button
                  onClick={handleRentCar}
                  className="flex-1 bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
                >
                  Pinjam
                </button>
                <button
                  onClick={() => {
                    setShowRentalForm(false);
                    setSelectedCar(null);
                    setRentalForm({ borrowerName: '', purpose: '' });
                  }}
                  className="flex-1 bg-gray-300 py-2 rounded hover:bg-gray-400"
                >
                  Batal
                </button>
              </div>
            </div>
          </div>
        )}

        {activeRentals.length > 0 && (
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <h2 className="text-xl font-bold mb-4">Peminjaman Aktif</h2>
            <div className="space-y-4">
              {activeRentals.map(rental => (
                <div key={rental.id} className="border rounded-lg p-4">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h3 className="font-bold">{rental.car_type}</h3>
                      <p className="text-gray-600">{rental.car_plate}</p>
                    </div>
                    <span className="bg-orange-100 text-orange-800 px-3 py-1 rounded text-sm">
                      Dipinjam
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 mb-3 text-sm">
                    <div>
                      <p className="text-gray-600">Peminjam:</p>
                      <p className="font-semibold">{rental.borrower_name}</p>
                    </div>
                    <div>
                      <p className="text-gray-600">Tujuan:</p>
                      <p className="font-semibold">{rental.purpose}</p>
                    </div>
                    <div className="flex items-center gap-1">
                      <Calendar size={16} className="text-gray-500" />
                      <span>{rental.rent_date}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock size={16} className="text-gray-500" />
                      <span>{rental.rent_time}</span>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      setReturningRental(rental);
                      setShowReturnForm(true);
                    }}
                    className="w-full bg-green-600 text-white py-2 rounded hover:bg-green-700"
                  >
                    Kembalikan Mobil
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {showReturnForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-96">
              <h2 className="text-xl font-bold mb-4">Form Pengembalian</h2>
              <div className="mb-3">
                <p className="text-sm text-gray-600">Mobil: {returningRental.car_type}</p>
                <p className="text-sm text-gray-600">Peminjam: {returningRental.borrower_name}</p>
              </div>
              <textarea
                placeholder="Kondisi mobil setelah digunakan"
                value={returnForm.condition}
                onChange={(e) => setReturnForm({ condition: e.target.value })}
                className="w-full border p-2 rounded mb-4 h-24"
              />
              <div className="flex gap-2">
                <button
                  onClick={handleReturnCar}
                  className="flex-1 bg-green-600 text-white py-2 rounded hover:bg-green-700"
                >
                  Kembalikan
                </button>
                <button
                  onClick={() => {
                    setShowReturnForm(false);
                    setReturningRental(null);
                    setReturnForm({ condition: '' });
                  }}
                  className="flex-1 bg-gray-300 py-2 rounded hover:bg-gray-400"
                >
                  Batal
                </button>
              </div>
            </div>
          </div>
        )}

        {showReport && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg p-6 w-full max-w-5xl max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold">Laporan Peminjaman</h2>
                <button
                  onClick={handlePrint}
                  className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                >
                  <Printer size={20} />
                  Cetak PDF
                </button>
              </div>

              <div className="grid md:grid-cols-4 gap-3 mb-4">
                <input
                  type="text"
                  placeholder="Nama Peminjam"
                  value={filterName}
                  onChange={(e) => setFilterName(e.target.value)}
                  className="border p-2 rounded"
                />
                <input
                  type="text"
                  placeholder="Jenis Mobil"
                  value={filterCar}
                  onChange={(e) => setFilterCar(e.target.value)}
                  className="border p-2 rounded"
                />
                <input
                  type="date"
                  value={filterDateFrom}
                  onChange={(e) => setFilterDateFrom(e.target.value)}
                  className="border p-2 rounded"
                />
                <input
                  type="date"
                  value={filterDateTo}
                  onChange={(e) => setFilterDateTo(e.target.value)}
                  className="border p-2 rounded"
                />
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-100">
                    <tr>
                      <th className="p-2 text-left">No</th>
                      <th className="p-2 text-left">Peminjam</th>
                      <th className="p-2 text-left">Mobil & Plat</th>
                      <th className="p-2 text-left">Pinjam</th>
                      <th className="p-2 text-left">Kembali</th>
                      <th className="p-2 text-left">Tujuan</th>
                      <th className="p-2 text-left">Kondisi</th>
                      <th className="p-2 text-left">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {getFilteredRentals().map((rental, idx) => (
                      <tr key={rental.id} className="border-b">
                        <td className="p-2">{idx + 1}</td>
                        <td className="p-2">{rental.borrower_name}</td>
                        <td className="p-2">
                          {rental.car_type}<br />
                          <span className="text-gray-600 text-xs">{rental.car_plate}</span>
                        </td>
                        <td className="p-2">
                          {rental.rent_date}<br />
                          <span className="text-gray-600 text-xs">{rental.rent_time}</span>
                        </td>
                        <td className="p-2">
                          {rental.return_date || '-'}<br />
                          <span className="text-gray-600 text-xs">{rental.return_time || '-'}</span>
                        </td>
                        <td className="p-2">{rental.purpose}</td>
                        <td className="p-2">{rental.condition || '-'}</td>
                        <td className="p-2">
                          <span className={`px-2 py-1 rounded text-xs ${
                            rental.status === 'Selesai'
                              ? 'bg-green-100 text-green-800'
                              : 'bg-orange-100 text-orange-800'
                          }`}>
                            {rental.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="mt-4 flex justify-end">
                <button
                  onClick={() => {
                    setShowReport(false);
                    setFilterName('');
                    setFilterCar('');
                    setFilterDateFrom('');
                    setFilterDateTo('');
                  }}
                  className="bg-gray-300 px-4 py-2 rounded hover:bg-gray-400"
                >
                  Tutup
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
```

---

## 📝 Cara Upload ke GitHub:

1. Di repository GitHub Anda, klik **Add file** → **Create new file**
2. Ketik nama file: `components/CarRentalSystem.js`
3. Copy SEMUA kode di atas (mulai dari `'use client';` sampai baris terakhir)
4. Paste ke editor GitHub
5. Klik **Commit changes**

✅ Selesai!
