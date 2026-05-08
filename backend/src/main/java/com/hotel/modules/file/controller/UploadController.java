package com.hotel.modules.file.controller;

import com.hotel.modules.file.service.UploadService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/files")
@RequiredArgsConstructor
public class UploadController {

    private final UploadService uploadService;

    @PostMapping("/upload")
    public ResponseEntity<Map<String, String>> uploadFile(@RequestParam("file") MultipartFile file) {
        String url = uploadService.uploadFile(file);
        Map<String, String> response = new HashMap<>();
        response.put("url", url);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/upload-url")
    public ResponseEntity<Map<String, String>> uploadFromUrl(@RequestParam("url") String imageUrl) {
        String url = uploadService.uploadFromUrl(imageUrl);
        Map<String, String> response = new HashMap<>();
        response.put("url", url);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/upload-multiple")
    public ResponseEntity<Map<String, List<String>>> uploadMultipleFiles(@RequestParam("files") MultipartFile[] files) {
        List<String> urls = uploadService.uploadMultipleFiles(files);
        Map<String, List<String>> response = new HashMap<>();
        response.put("urls", urls);
        return ResponseEntity.ok(response);
    }
}
