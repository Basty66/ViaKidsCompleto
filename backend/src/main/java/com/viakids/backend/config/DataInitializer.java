package com.viakids.backend.config;

import com.viakids.backend.bus.Bus;
import com.viakids.backend.bus.BusRepository;
import com.viakids.backend.incident.Incident;
import com.viakids.backend.incident.IncidentRepository;
import com.viakids.backend.notification.Notification;
import com.viakids.backend.notification.NotificationRepository;
import com.viakids.backend.route.Route;
import com.viakids.backend.route.RouteRepository;
import com.viakids.backend.student.Student;
import com.viakids.backend.student.StudentRepository;
import com.viakids.backend.user.User;
import com.viakids.backend.user.UserRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.UUID;

@Component
public class DataInitializer implements CommandLineRunner {

    private final UserRepository userRepository;
    private final BusRepository busRepository;
    private final RouteRepository routeRepository;
    private final StudentRepository studentRepository;
    private final NotificationRepository notificationRepository;
    private final IncidentRepository incidentRepository;
    private final PasswordEncoder passwordEncoder;

    public DataInitializer(UserRepository userRepository, BusRepository busRepository,
                           RouteRepository routeRepository, StudentRepository studentRepository,
                           NotificationRepository notificationRepository,
                           IncidentRepository incidentRepository, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.busRepository = busRepository;
        this.routeRepository = routeRepository;
        this.studentRepository = studentRepository;
        this.notificationRepository = notificationRepository;
        this.incidentRepository = incidentRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public void run(String... args) {
        if (userRepository.count() > 0) return;

        // Users
        User admin = new User();
        admin.setNombre("Admin ViaKids");
        admin.setEmail("admin@viakids.cl");
        admin.setPassword(passwordEncoder.encode("123456"));
        admin.setRol(User.Role.ADMIN);
        admin.setEstado(User.UserStatus.ACTIVO);
        userRepository.save(admin);

        User driver = new User();
        driver.setNombre("Juan Pérez");
        driver.setEmail("conductor@viakids.cl");
        driver.setPassword(passwordEncoder.encode("123456"));
        driver.setRol(User.Role.DRIVER);
        driver.setEstado(User.UserStatus.ACTIVO);
        userRepository.save(driver);

        User parent = new User();
        parent.setNombre("Carlos Ruiz");
        parent.setEmail("apoderado@viakids.cl");
        parent.setPassword(passwordEncoder.encode("123456"));
        parent.setRol(User.Role.PARENT);
        parent.setEstado(User.UserStatus.ACTIVO);
        userRepository.save(parent);

        // Buses
        Bus b1 = new Bus();
        b1.setPatente("AB-1234");
        b1.setConductor("Juan Pérez");
        b1.setCapacidad(40);
        b1.setEstado(Bus.BusStatus.EN_RUTA);
        b1.setTiempoEstimado("15 min");
        b1.setLat(-33.4489);
        b1.setLng(-70.6693);
        b1 = busRepository.save(b1);

        Bus b2 = new Bus();
        b2.setPatente("CD-5678");
        b2.setConductor("Ana López");
        b2.setCapacidad(35);
        b2.setEstado(Bus.BusStatus.EN_ESPERA);
        b2.setTiempoEstimado("--");
        b2.setLat(-33.4560);
        b2.setLng(-70.6500);
        b2 = busRepository.save(b2);

        Bus b3 = new Bus();
        b3.setPatente("EF-9012");
        b3.setConductor("Carlos Ruiz");
        b3.setCapacidad(45);
        b3.setEstado(Bus.BusStatus.EN_RUTA);
        b3.setTiempoEstimado("30 min");
        b3.setLat(-33.4400);
        b3.setLng(-70.6800);
        busRepository.save(b3);

        // Routes
        Route r1 = new Route();
        r1.setNombre("Ruta Norte");
        r1.setColegio("Colegio Los Andes");
        r1.setBusId(b1.getId());
        r1.setHorario("07:30");
        r1.setParadas(8);
        r1 = routeRepository.save(r1);

        Route r2 = new Route();
        r2.setNombre("Ruta Sur");
        r2.setColegio("Colegio Santiago");
        r2.setBusId(b3.getId());
        r2.setHorario("08:00");
        r2.setParadas(6);
        routeRepository.save(r2);

        // Students
        Student s1 = new Student();
        s1.setNombre("Mateo García");
        s1.setCurso("4to B");
        s1.setRut("20.123.456-7");
        s1.setApoderado("Carlos Ruiz");
        s1.setTelefono("+56912345678");
        s1.setBusId(b1.getId());
        s1.setRouteId(r1.getId());
        s1.setColegio("Colegio Los Andes");
        s1.setEstado(Student.StudentStatus.EN_ESPERA);
        s1.setParentId(parent.getId());
        s1.setHorario(Student.Horario.MANANA);
        studentRepository.save(s1);

        Student s2 = new Student();
        s2.setNombre("Sofía Rodríguez");
        s2.setCurso("2do A");
        s2.setRut("21.234.567-8");
        s2.setApoderado("María Rodríguez");
        s2.setTelefono("+56987654321");
        s2.setBusId(b1.getId());
        s2.setRouteId(r1.getId());
        s2.setColegio("Colegio Los Andes");
        s2.setEstado(Student.StudentStatus.EN_ESPERA);
        studentRepository.save(s2);

        Student s3 = new Student();
        s3.setNombre("Lucas Martínez");
        s3.setCurso("3ro C");
        s3.setRut("20.345.678-9");
        s3.setApoderado("Pedro Martínez");
        s3.setTelefono("+56911223344");
        s3.setBusId(b3.getId());
        s3.setRouteId(r2.getId());
        s3.setColegio("Colegio Santiago");
        s3.setEstado(Student.StudentStatus.EN_ESPERA);
        studentRepository.save(s3);

        // Notifications
        Notification n1 = new Notification();
        n1.setFecha("Hoy, 07:45");
        n1.setTipo(Notification.NotificationType.ALERTA);
        n1.setMensaje("Bus retrasado 15 min por tráfico.");
        n1.setRuta("Ruta Norte");
        n1.setLeido(false);
        notificationRepository.save(n1);

        Notification n2 = new Notification();
        n2.setFecha("Hoy, 08:00");
        n2.setTipo(Notification.NotificationType.INFO);
        n2.setMensaje("Todos los buses operando normalmente.");
        n2.setRuta("Todas");
        n2.setLeido(true);
        notificationRepository.save(n2);

        Notification n3 = new Notification();
        n3.setFecha("Ayer, 16:30");
        n3.setTipo(Notification.NotificationType.INFO);
        n3.setMensaje("Ruta completada exitosamente.");
        n3.setRuta("Ruta Sur");
        n3.setLeido(true);
        notificationRepository.save(n3);

        // Incidents
        Incident i1 = new Incident();
        i1.setFecha(LocalDate.now().format(DateTimeFormatter.ofPattern("dd-MM-yyyy")));
        i1.setTipo(Incident.IncidentType.MECANICO);
        i1.setDescripcion("Falla menor en motor, resuelto en ruta.");
        i1.setBusPatente("AB-1234");
        i1.setResuelto(true);
        incidentRepository.save(i1);

        Incident i2 = new Incident();
        i2.setFecha(LocalDate.now().minusDays(1).format(DateTimeFormatter.ofPattern("dd-MM-yyyy")));
        i2.setTipo(Incident.IncidentType.TRAFICO);
        i2.setDescripcion("Retraso de 20 min por congestión.");
        i2.setBusPatente("EF-9012");
        i2.setResuelto(true);
        incidentRepository.save(i2);
    }
}
