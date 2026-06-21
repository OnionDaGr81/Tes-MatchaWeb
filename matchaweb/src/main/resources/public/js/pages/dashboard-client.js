// Theme Logic
        

        let currentUser = null;

        window.init_dashboard_client = function() {
            const userSession = localStorage.getItem('matcha_user');
            
            if (!userSession) {
                alert("Anda harus masuk terlebih dahulu!");
                window.location.href = '/login.html';
                return;
            }

            currentUser = JSON.parse(userSession);

            if (currentUser.role.toLowerCase() === 'talent') {
                window.location.href = '/dashboard-talent.html';
                return;
            }

            document.getElementById('nav-greeting').innerHTML = `Halo, <b style="color:var(--primary);">${currentUser.nama.split(' ')[0]}</b>!`;
            document.getElementById('profile-nama').innerText = currentUser.nama;
            document.getElementById('profile-email').innerText = currentUser.email;
            document.getElementById('profile-telp').innerText = currentUser.noTelp || '-';

            fetchBookingHistory();
        };

        function fetchBookingHistory() {
            const container = document.getElementById('booking-container');
            
            // Show skeletons
            container.innerHTML = '';
            for (let i = 0; i < 3; i++) {
                const skeleton = document.createElement('div');
                skeleton.className = 'booking-card';
                skeleton.innerHTML = `
                    <div class="skeleton skeleton-title" style="width: 150px; margin-bottom: 8px;"></div>
                    <div class="skeleton skeleton-text short" style="margin-bottom: 5px;"></div>
                    <div class="skeleton skeleton-text" style="width: 80%; margin-bottom: 10px;"></div>
                    <div class="skeleton" style="width: 100px; height: 24px; border-radius: 12px; display: inline-block;"></div>
                `;
                container.appendChild(skeleton);
            }
            
            fetch(`/api/bookings?userId=${currentUser.id}&role=client`)
                .then(res => res.json())
                .then(result => {
                    setTimeout(() => {
                        container.innerHTML = ''; 

                    if (result.status === 'success') {
                        const bookings = result.data;

                        if (bookings.length === 0) {
                            container.innerHTML = `<p class="empty-state">Kamu belum pernah menyewa companion. Yuk jelajahi katalog talent kami!</p>`;
                            return;
                        }

                        bookings.forEach(b => {
                            let statusClass = 'status-pending';
                            let statusText = 'Menunggu Konfirmasi';
                            
                            if (b.status === 'CONFIRMED') { statusClass = 'status-confirmed'; statusText = 'Diterima'; }
                            else if (b.status === 'CANCELLED') { statusClass = 'status-cancelled'; statusText = 'Ditolak'; }
                            else if (b.status === 'COMPLETED') { statusClass = 'status-confirmed'; statusText = 'Selesai'; }

                            const tglMulai = new Date(b.waktuMulai).toLocaleString('id-ID');
                            const tglSelesai = new Date(b.waktuSelesai).toLocaleString('id-ID');

                            container.innerHTML += `
                                <div class="booking-card">
                                    <h4>ID Pesanan: ${b.id}</h4>
                                    <p>ID Layanan: ${b.serviceId}</p>
                                    <p>Jadwal: ${tglMulai} - ${tglSelesai}</p>
                                    <span class="status-badge ${statusClass}">${statusText}</span>
                                </div>
                            `;
                        });
                    }
                    }, 300);
                })
                .catch(err => {
                    container.innerHTML = `<p class="empty-state" style="color: var(--danger);">Gagal menarik data dari server.</p>`;
                });
        }

        