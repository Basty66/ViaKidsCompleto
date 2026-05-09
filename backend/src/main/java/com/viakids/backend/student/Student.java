package com.viakids.backend.student;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;

@Entity
@Table(name = "students")
@Data
@NoArgsConstructor
public class Student {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(nullable = false)
    private String nombre;

    @Column(nullable = false)
    private String curso;

    private String rut;

    private String apoderado;

    private String telefono;

    private String colegio;

    @Enumerated(EnumType.STRING)
    private StudentStatus estado = StudentStatus.EN_ESPERA;

    @Column(name = "bus_id")
    private UUID busId;

    @Column(name = "route_id")
    private UUID routeId;

    @Column(name = "parent_id")
    private UUID parentId;

    @Enumerated(EnumType.STRING)
    private Horario horario = Horario.MANANA;

    @Transient
    private String busPatente;

    @Transient
    private String ruta;

    public enum StudentStatus {
        EN_ESPERA, EN_BUS, ENTREGADO, AUSENTE
    }

    public enum Horario {
        MANANA, TARDE
    }
}
