package com.viakids.backend.student;

import com.viakids.backend.bus.Bus;
import com.viakids.backend.bus.BusRepository;
import com.viakids.backend.route.Route;
import com.viakids.backend.route.RouteRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class StudentService {

    private final StudentRepository studentRepository;
    private final BusRepository busRepository;
    private final RouteRepository routeRepository;

    public StudentService(StudentRepository studentRepository, BusRepository busRepository,
                          RouteRepository routeRepository) {
        this.studentRepository = studentRepository;
        this.busRepository = busRepository;
        this.routeRepository = routeRepository;
    }

    public List<Student> getAll() {
        return enrichAll(studentRepository.findAll());
    }

    public Student getById(UUID id) {
        return enrich(studentRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Estudiante no encontrado")));
    }

    public Student create(Student student) {
        student.setId(null);
        if (student.getEstado() == null) student.setEstado(Student.StudentStatus.EN_ESPERA);
        return enrich(studentRepository.save(student));
    }

    public Student update(UUID id, Student updates) {
        Student student = studentRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Estudiante no encontrado"));
        student.setNombre(updates.getNombre());
        student.setCurso(updates.getCurso());
        student.setRut(updates.getRut());
        student.setApoderado(updates.getApoderado());
        student.setTelefono(updates.getTelefono());
        student.setColegio(updates.getColegio());
        student.setEstado(updates.getEstado());
        student.setBusId(updates.getBusId());
        student.setRouteId(updates.getRouteId());
        return enrich(studentRepository.save(student));
    }

    public List<Student> getByParentId(UUID parentId) {
        return enrichAll(studentRepository.findByParentId(parentId));
    }

    public void delete(UUID id) {
        studentRepository.deleteById(id);
    }

    private Student enrich(Student student) {
        if (student.getBusId() != null) {
            busRepository.findById(student.getBusId()).ifPresent(bus -> {
                student.setBusPatente(bus.getPatente());
            });
        }
        if (student.getRouteId() != null) {
            routeRepository.findById(student.getRouteId()).ifPresent(route -> {
                student.setRuta(route.getNombre());
            });
        }
        return student;
    }

    private List<Student> enrichAll(List<Student> students) {
        return students.stream().map(this::enrich).collect(Collectors.toList());
    }
}
