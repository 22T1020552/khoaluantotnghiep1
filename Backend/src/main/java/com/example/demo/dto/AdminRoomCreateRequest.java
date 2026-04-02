package com.example.demo.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class AdminRoomCreateRequest {

    @NotBlank(message = "roomName is required")
    @Size(max = 100, message = "roomName must be at most 100 characters")
    private String roomName;
}