package com.viakids.backend.user;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "users")
@Data
@NoArgsConstructor
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(nullable = false)
    private String nombre;

    @Column(nullable = false, unique = true)
    private String email;

    @Column(nullable = false)
    private String password;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Role rol;

    private String telefono;

    private String rut;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private UserStatus estado = UserStatus.ACTIVO;

    @CreationTimestamp
    private LocalDateTime createdAt;

    public enum Role {
        ADMIN, DRIVER, PARENT
    }

    public enum UserStatus {
        ACTIVO, SUSPENDIDO
    }
}
