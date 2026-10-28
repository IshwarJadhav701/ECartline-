package com.ecartline.controller;

import com.ecartline.config.UserPrincipal;
import com.ecartline.dto.AddressDto;
import com.ecartline.dto.ApiResponse;
import com.ecartline.service.AddressService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/addresses")
public class AddressController {

    private final AddressService addressService;

    public AddressController(AddressService addressService) {
        this.addressService = addressService;
    }

    @GetMapping
    public ResponseEntity<Map<String, Object>> getUserAddresses(@AuthenticationPrincipal UserPrincipal principal) {
        List<AddressDto> list = addressService.getUserAddresses(principal.getId());
        return ResponseEntity.ok(Map.of("success", true, "data", list));
    }

    @PostMapping
    public ResponseEntity<Map<String, Object>> createAddress(
            @AuthenticationPrincipal UserPrincipal principal,
            @RequestBody AddressDto dto) {
        AddressDto created = addressService.createAddress(principal.getId(), dto);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(Map.of("success", true, "message", "Address saved", "data", created));
    }

    @PutMapping("/{id}")
    public ResponseEntity<Map<String, Object>> updateAddress(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable Long id,
            @RequestBody AddressDto dto) {
        AddressDto updated = addressService.updateAddress(principal.getId(), id, dto);
        return ResponseEntity.ok(Map.of("success", true, "message", "Address updated", "data", updated));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse> deleteAddress(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable Long id) {
        addressService.deleteAddress(principal.getId(), id);
        return ResponseEntity.ok(ApiResponse.ok("Address deleted"));
    }

    @PutMapping("/{id}/default")
    public ResponseEntity<Map<String, Object>> setDefaultAddress(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable Long id) {
        AddressDto updated = addressService.setDefaultAddress(principal.getId(), id);
        return ResponseEntity.ok(Map.of("success", true, "message", "Default address updated", "data", updated));
    }
}
