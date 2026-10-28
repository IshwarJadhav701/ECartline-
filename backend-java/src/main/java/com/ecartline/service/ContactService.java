package com.ecartline.service;

import com.ecartline.dto.ContactDto;
import com.ecartline.entity.ContactMessage;
import com.ecartline.exception.ApiException;
import com.ecartline.repository.ContactMessageRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class ContactService {

    private final ContactMessageRepository contactMessageRepository;

    public ContactService(ContactMessageRepository contactMessageRepository) {
        this.contactMessageRepository = contactMessageRepository;
    }

    @Transactional
    public void submitMessage(ContactDto dto) {
        String name = dto.getName() != null ? dto.getName().trim() : "";
        String email = dto.getEmail() != null ? dto.getEmail().trim().toLowerCase() : "";
        String phone = dto.getPhone() != null ? dto.getPhone().trim() : null;
        String message = dto.getMessage() != null ? dto.getMessage().trim() : "";

        if (name.length() < 2) throw new ApiException(HttpStatus.BAD_REQUEST, "Please enter your name");
        if (!AuthService.isEmailValid(email)) throw new ApiException(HttpStatus.BAD_REQUEST, "Please enter a valid email address");
        if (message.length() < 8) throw new ApiException(HttpStatus.BAD_REQUEST, "Message must be at least 8 characters long");

        ContactMessage msg = new ContactMessage();
        msg.setName(name);
        msg.setEmail(email);
        msg.setPhone(phone);
        msg.setMessage(message);

        contactMessageRepository.save(msg);
    }

    public List<ContactMessage> getAllMessages() {
        return contactMessageRepository.findAllByOrderByCreatedAtDesc();
    }
}
