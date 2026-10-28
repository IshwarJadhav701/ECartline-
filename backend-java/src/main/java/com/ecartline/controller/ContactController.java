package com.ecartline.controller;

import com.ecartline.dto.ApiResponse;
import com.ecartline.dto.ContactDto;
import com.ecartline.entity.ContactMessage;
import com.ecartline.service.ContactService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/contact")
public class ContactController {

    private final ContactService contactService;

    public ContactController(ContactService contactService) {
        this.contactService = contactService;
    }

    @PostMapping
    public ResponseEntity<ApiResponse> submitContact(@RequestBody ContactDto dto) {
        contactService.submitMessage(dto);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.ok("Thank you for reaching out! Our team will contact you shortly."));
    }

    @GetMapping
    public ResponseEntity<Map<String, Object>> getAllContactMessages() {
        List<ContactMessage> list = contactService.getAllMessages();
        return ResponseEntity.ok(Map.of("success", true, "count", list.size(), "data", list));
    }
}
