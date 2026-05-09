package com.viakids.backend.student;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface StudentRepository extends JpaRepository<Student, UUID> {
    List<Student> findByBusId(UUID busId);
    List<Student> findByRouteId(UUID routeId);
    List<Student> findByEstado(Student.StudentStatus estado);
    List<Student> findByParentId(UUID parentId);
}
