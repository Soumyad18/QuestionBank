package com.qb.auth.model;

/**
 * Immutable representation of an authenticated user extracted from a Supabase JWT.
 */
public record AuthenticatedUser(
        String id,
        String email,
        Role role
) {
    public enum Role { ADMIN, USER }

    public boolean isAdmin() {
        return role == Role.ADMIN;
    }
}
