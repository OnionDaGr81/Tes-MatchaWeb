import com.matcha.model.Booking;
import com.matcha.repository.BookingRepository;
import java.time.LocalDateTime;
public class TestDB {
    public static void main(String[] args) {
        BookingRepository repo = new BookingRepository();
        Booking b = new Booking();
        b.setId(java.util.UUID.randomUUID().toString());
        b.setClientId("CL001");
        b.setTalentId("TL001");
        b.setServiceId("SRV001");
        b.setWaktuMulai(LocalDateTime.now().plusDays(1));
        b.setWaktuSelesai(LocalDateTime.now().plusDays(1).plusHours(2));
        b.setStatus("PENDING");
        boolean res = repo.createBooking(b);
        System.out.println("Result: " + res);
    }
}
