package com.viakids.backend.student;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/students")
public class StudentController {

    private final StudentService studentService;

    public StudentController(StudentService studentService) {
        this.studentService = studentService;
    }

    @GetMapping
    public java.util.List<Student> getAll() {
        return studentService.getAll();
    }

    @GetMapping("/{id}")
    public Student getById(@PathVariable UUID id) {
        return studentService.getById(id);
    }

    @GetMapping("/by-parent/{parentId}")
    public java.util.List<Student> getByParentId(@PathVariable UUID parentId) {
        return studentService.getByParentId(parentId);
    }

    @PostMapping
    public Student create(@RequestBody Student student) {
        return studentService.create(student);
    }

    @PutMapping("/{id}")
    public Student update(@PathVariable UUID id, @RequestBody Student student) {
        return studentService.update(id, student);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> delete(@PathVariable UUID id) {
        studentService.delete(id);
        return ResponseEntity.ok(Map.of("success", true));
    }

    @GetMapping("/{id}/qr")
    public ResponseEntity<?> getQRData(@PathVariable UUID id) {
        Student student = studentService.getById(id);
        return ResponseEntity.ok(Map.of(
                "id", student.getId().toString(),
                "nombre", student.getNombre(),
                "curso", student.getCurso(),
                "rut", student.getRut(),
                "busId", student.getBusId() != null ? student.getBusId().toString() : ""
        ));
    }
}
