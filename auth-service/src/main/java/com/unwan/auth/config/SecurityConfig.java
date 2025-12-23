package com.unwan.auth.config;

import io.netty.handler.codec.http.HttpMethod;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configuration.WebSecurityConfigurerAdapter;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;

@Configuration
@EnableWebSecurity
public class SecurityConfig extends WebSecurityConfigurerAdapter {

    @Override
    protected void configure(HttpSecurity http) throws Exception {
        http
                .cors().and()                // IMPORTANT: let Spring Security use our CORS config
                .csrf().disable()
                .authorizeRequests()
                .antMatchers(String.valueOf(HttpMethod.OPTIONS), "/**").permitAll() // <-- correct usage
                .antMatchers("/api/auth/**", "/callback/**", "/api/oauth/**").permitAll()
                .anyRequest().authenticated()
                .and()
                .httpBasic().disable();
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }
}