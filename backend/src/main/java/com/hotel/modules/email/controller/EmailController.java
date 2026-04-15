package com.hotel.modules.email.controller;

import com.hotel.modules.email.dto.EmailRequest;
import com.hotel.modules.email.service.EmailService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;


@RestController
@Slf4j
@RequiredArgsConstructor
public class EmailController {
    private final EmailService emailService;


    @GetMapping("/sendMail")
    public  void sendMail(@RequestParam String email, @RequestParam String subject, @RequestBody EmailRequest request){
        emailService.sendMailWithThymeleaf(email, subject,request);
    }

}
