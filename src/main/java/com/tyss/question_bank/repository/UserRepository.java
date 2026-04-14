package com.tyss.question_bank.repository;

import com.tyss.question_bank.entity.User;
import org.springframework.data.mongodb.repository.MongoRepository;

public interface UserRepository extends MongoRepository<User,String> {
}
