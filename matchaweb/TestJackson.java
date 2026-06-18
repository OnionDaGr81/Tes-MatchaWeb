import com.fasterxml.jackson.databind.ObjectMapper;
import com.matcha.model.Booking;

public class TestJackson {
    public static void main(String[] args) {
        try {
            String json = "{\"clientId\":\"CL001\",\"talentId\":\"TL001\",\"serviceId\":\"SRV001\",\"waktuMulai\":\"2026-06-20T14:00:00\",\"waktuSelesai\":\"2026-06-20T16:00:00\",\"status\":\"pending\"}";
            ObjectMapper mapper = new ObjectMapper();
            Booking b = mapper.readValue(json, Booking.class);
            System.out.println("Parsed Booking:");
            System.out.println("ClientId: " + b.getClientId());
            System.out.println("TalentId: " + b.getTalentId());
            System.out.println("ServiceId: " + b.getServiceId());
            System.out.println("WaktuMulai: " + b.getWaktuMulai());
            System.out.println("WaktuSelesai: " + b.getWaktuSelesai());
            System.out.println("Status: " + b.getStatus());
        } catch (Exception e) {
            e.printStackTrace();
        }
    }
}
