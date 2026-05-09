package com.viakids.backend.auth;

import com.viakids.backend.config.JwtTokenProvider;
import com.viakids.backend.user.User;
import com.viakids.backend.user.UserRepository;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenProvider jwtTokenProvider;

    public AuthService(UserRepository userRepository, PasswordEncoder passwordEncoder,
                       JwtTokenProvider jwtTokenProvider) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtTokenProvider = jwtTokenProvider;
    }

    public LoginResponse login(LoginRequest request) {
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new BadCredentialsException("Correo o contraseña incorrectos"));

        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            throw new BadCredentialsException("Correo o contraseña incorrectos");
        }

        if (user.getEstado() == User.UserStatus.SUSPENDIDO) {
            throw new BadCredentialsException("Usuario suspendido. Contacta al administrador.");
        }

        String token = jwtTokenProvider.generateToken(user.getEmail(), user.getRol().name().toLowerCase());
        return new LoginResponse(token, user.getRol().name().toLowerCase(), user.getNombre(), user.getId().toString());
    }

    public LoginResponse register(RegisterRequest request) {
        if (userRepository.findByEmail(request.getEmail()).isPresent()) {
            throw new IllegalArgumentException("El correo ya está registrado");
        }

        User user = new User();
        user.setNombre(request.getNombre());
        user.setEmail(request.getEmail());
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setRol(User.Role.ADMIN);
        user.setEstado(User.UserStatus.ACTIVO);
        user.setTelefono(request.getTelefono());
        userRepository.save(user);

        String token = jwtTokenProvider.generateToken(user.getEmail(), user.getRol().name().toLowerCase());
        return new LoginResponse(token, user.getRol().name().toLowerCase(), user.getNombre(), user.getId().toString());
    }
}
